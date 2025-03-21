import { Object3D, WebGLRenderTarget } from "three";
import { virtualAgent } from "../bit-systems/agent-system";
import { ResponseData, COMPONENT_ENDPOINTS, COMPONENT_CODES, CODE_DESCRIPTIONS } from "./component-types";
import { SoundAnalyzer } from "./silence-detector";
import { AElement } from "aframe";
import { degToRad } from "three/src/math/MathUtils";

let mediaRecorder: MediaRecorder | null = null;
let chunks: any[] = [];
export let isRecording = false;

export async function RecordQuestion(): Promise<any> {
  return new Promise((resolve, reject) => {
    const audioTrack = APP.mediaDevicesManager!.audioTrack;
    const recordingTrack = audioTrack.clone();
    const recordingStream = new MediaStream([recordingTrack]);
    mediaRecorder = new MediaRecorder(recordingStream);
    audioTrack.enabled = false;

    const soundAnalyzer = new SoundAnalyzer({ stream: recordingStream });

    soundAnalyzer.on("start", () => {
      virtualAgent.isListening = true;
    });

    soundAnalyzer.on("stop", () => {
      virtualAgent.isListening = false;
    });

    soundAnalyzer.Start();

    mediaRecorder.ondataavailable = event => {
      chunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const recordingBlob = new Blob(chunks, { type: "audio/wav" });
      chunks.length = 0;
      audioTrack.enabled = true;
      recordingStream.removeTrack(recordingTrack);
      recordingTrack.stop();
      soundAnalyzer.Stop();

      resolve({
        status: { code: COMPONENT_CODES.Successful, text: CODE_DESCRIPTIONS[COMPONENT_CODES.Successful] },
        data: { file: recordingBlob }
      });
    };

    mediaRecorder.onerror = event => {
      reject({
        status: {
          code: COMPONENT_CODES.MediaRecorderError,
          text: CODE_DESCRIPTIONS[COMPONENT_CODES.MediaRecorderError]
        }
      });
    };

    mediaRecorder.start();
    isRecording = true;
  });
}

export function stopRecording() {
  mediaRecorder!.stop();
  isRecording = false;
}

export function saveFile(blob: Blob, ext: string) {
  const blobUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  downloadLink.href = blobUrl;
  downloadLink.download = "file.".concat(ext);
  downloadLink.click();
  URL.revokeObjectURL(blobUrl);
}

// TODO: make this function inference in a vague way
export async function audioModules(
  endPoint: COMPONENT_ENDPOINTS,
  data: Blob,
  parameters: Record<string, any>,
  signal?: AbortSignal
) {
  const formData = new FormData();
  formData.append("audio_files", data, "recording.wav");
  const queryString = Object.keys(parameters)
    .map(key => `${key}=${parameters[key]}`)
    .join("&");

  const response = await fetch(endPoint + `?${queryString}`, {
    method: "POST",
    body: formData,
    signal: signal
  });

  const responseData = await response.json();

  if (response.status >= 300 || !responseData || !responseData.translations[0])
    throw new Error("Bad response from translation server");

  return responseData.translations[0];
}

export async function textModule(endPoint: COMPONENT_ENDPOINTS, data: string, parameters: Record<string, any>) {
  const queryString = Object.keys(parameters)
    .map(key => `${key}=${parameters[key]}`)
    .join("&");

  const requestBody = { text: data };

  const response = await fetch(endPoint + `?${queryString}`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  const responseJson = await response.json();
  if (response.status >= 300 || !responseJson || !responseJson.translations[0])
    throw new Error("Bad response from text translation module");

  return responseJson.translations[0];
}

export async function intentionModule(englishTranscription: string) {
  const headers = { Accept: "application/json", "Content-Type": "application/json" };
  const data = { user_query: englishTranscription };

  const response = await fetch(COMPONENT_ENDPOINTS.INTENTION, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data)
  });

  const responseData = await response.json();

  if (response.status >= 300 || !responseData) throw new Error("Bad response from intention module");

  return responseData;
}

export async function dsResponseModule(
  userQuery: string,
  intent: string,
  mozillaInput?: string
): Promise<ResponseData> {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };

  const data = { user_query: userQuery, intent: intent, mozilla_input: mozillaInput };

  const response = await fetch(COMPONENT_ENDPOINTS.TASK_RESPONSE, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data)
  });

  const responseData = await response.json();

  if (response.status >= 300 || !responseData || !responseData.response)
    throw new Error("bad response from dialogue agent");

  return responseData.response;
}

export async function vlModule(destination: string, vlModule: COMPONENT_ENDPOINTS) {
  const formData = new FormData();
  const avatarHead = (document.querySelector("#avatar-pov-node") as AElement).object3D;

  await new Promise<void>(resolve => {
    const checkTilt = () => {
      if (
        avatarHead.rotation.x >= degToRad(-15) &&
        avatarHead.rotation.x <= degToRad(15) &&
        avatarHead.rotation.z >= degToRad(-10) &&
        avatarHead.rotation.z <= degToRad(10)
      ) {
        resolve();
      } else {
        console.log(`waiting to correct tilt`);
        requestAnimationFrame(checkTilt); // Keeps checking without freezing
      }
    };
    checkTilt();
  });
  // avatarHead.rotation.set(getRandom(-15, 15), 0, getRandomNumber(-10, 10));

  const pov = await SnapPov();
  formData.append("file", pov, "camera_pov.png");
  const response = await fetch(`${vlModule}?question=${destination}`, {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  if (response.status >= 300 || !data || !data.Directions) throw new Error("bad response from vl module");

  return data.Directions;
}

export async function SnapPov() {
  virtualAgent.agent.obj!.visible = false;
  virtualAgent.agent.obj!.updateMatrix();
  const renderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight);
  APP.scene?.renderer.setRenderTarget(renderTarget);
  APP.scene?.renderer.render(APP.scene!.object3D, APP.scene!.camera);
  APP.scene?.renderer.setRenderTarget(null);
  const canvas = APP.scene!.renderer.domElement;
  virtualAgent.agent.obj!.visible = true;
  virtualAgent.agent.obj!.updateMatrix();
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("something went wrong");
  return blob;
}

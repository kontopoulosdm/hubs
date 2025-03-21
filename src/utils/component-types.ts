export enum COMPONENT_ENDPOINTS {
  TRANSLATE_AUDIO = "https://dev.speech-voxreality.maggioli-research.gr/translate_audio",
  TRANSLATE_TEXT = "https://audiotranslation.vox.lab.synelixis.com/translate_text",
  TRANSCRIBE_AUDIO_FILES = "https://audiotranslation.vox.lab.synelixis.com/transcribe_audio_files",
  TRANSLATE_AUDIO_FILES = "https://audiotranslation.vox.lab.synelixis.com/translate_audio_files",
  TRANSLATE_LOCAL_AUDIO_FILES = "http://127.0.0.1:8080/translate_audio_files",
  LXMERT = "https://dev.voxreality.maggioli-research.gr/lxmert/",
  GPT = "https://dev.gpt-voxreality.maggioli-research.gr/cap_gpt2/",
  INTENTION = "https://dev.conference-agent-voxreality.lab.synelixis.com/intent_dest/",
  TASK_RESPONSE = "https://dev.conference-agent-voxreality.lab.synelixis.com/response/",
  LOCAL_VLM = "http://172.23.26.99:5044/navqa"
}

export enum RECORDER_CODES {
  SUCCESSFUL,
  ERROR,
  STOP
}
export const RECORDER_TEXT: Record<RECORDER_CODES, string> = {
  [RECORDER_CODES.SUCCESSFUL]: "successful",
  [RECORDER_CODES.ERROR]: "media recorder error",
  [RECORDER_CODES.STOP]: "recording stopped"
};

export enum LANGUAGES {
  ENGLISH = "en",
  GREEK = "el",
  SPANISH = "es",
  ITALIAN = "it",
  DUTCH = "nl",
  GERMAN = "de"
}

export interface ResponseData {
  status: {
    code: number;
    text: string;
  };
  data?: {
    file?: Blob;
    text_init?: string;
    text_en?: string;
    task_descript?: string;
    start?: number;
    dest?: number;
    descript?: any;
    transcriptions?: string[];
    translations?: string[];
    destination?: string;
    intent?: string;
    response?: string;
  };
}

export enum COMPONENT_CODES {
  Successful,
  FetchError,
  MediaRecorderError,
  RecordingStopped,
  NmtResponseError,
  UknownTask,
  UnknownDest
}

export const CODE_DESCRIPTIONS: Record<COMPONENT_CODES, string> = {
  [COMPONENT_CODES.Successful]: "Successfull",
  [COMPONENT_CODES.FetchError]: "Fetch fail",
  [COMPONENT_CODES.MediaRecorderError]: "Media Recorder Error",
  [COMPONENT_CODES.RecordingStopped]: "Recording Stopped",
  [COMPONENT_CODES.NmtResponseError]: "Error with the response of the NMT module",
  [COMPONENT_CODES.UknownTask]: "Uknown Task",
  [COMPONENT_CODES.UnknownDest]: "Uknown Destination"
};

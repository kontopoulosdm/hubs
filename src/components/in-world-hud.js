import { SOUND_SPAWN_PEN } from "../systems/sound-effects-system";
import { roomPropertiesReader } from "../utils/rooms-properties";
/**
 * HUD panel for muting, freezing, and other controls that don't necessarily have hardware buttons.
 * @namespace ui
 * @component in-world-hud
 */
AFRAME.registerComponent("in-world-hud", {
  init() {
    this.mic = this.el.querySelector(".mic");
    this.agentBtn = this.el.querySelector(".agent-btn");
    this.mapBtn = this.el.querySelector(".map-btn");
    this.helpBtn = this.el.querySelector(".help-btn");
    this.transBtn = this.el.querySelector(".trans-btn");
    this.askBtn = this.el.querySelector(".ask-btn");
    this.background = this.el.querySelector(".bg");

    this.onMicStateChanged = () => {
      this.mic.setAttribute("mic-button", "active", APP.dialog.isMicEnabled);
    };
    APP.dialog.on("mic-state-changed", this.onMicStateChanged);

    this.updateButtonStates = () => {
      console.log(`updating button states`);
      this.mic.setAttribute("mic-button", "active", APP.dialog.isMicEnabled);

      roomPropertiesReader.waitForProperties().then(() => {
        this.agentBtn.setAttribute("icon-button", "disabled", !roomPropertiesReader.AllowsAgent);
        this.mapBtn.setAttribute("icon-button", "disabled", !roomPropertiesReader.AllowsMap);
        this.helpBtn.setAttribute("icon-button", "disabled", !roomPropertiesReader.AllowsHelp);
        this.transBtn.setAttribute("icon-button", "disabled", !roomPropertiesReader.AllowPresentation);
        this.askBtn.setAttribute("icon-button", "disabled", !roomPropertiesReader.AllowPresentation);

        // this.taskBtn.setAttribute("icon-button", "active", this.el.sceneEl.is("task"));

        if (roomPropertiesReader.AllowsAgent)
          this.agentBtn.setAttribute("icon-button", "active", this.el.sceneEl.is("agent"));
        if (roomPropertiesReader.AllowsMap)
          this.mapBtn.setAttribute("icon-button", "active", this.el.sceneEl.is("map"));
        if (roomPropertiesReader.AllowsHelp)
          this.helpBtn.setAttribute("icon-button", "active", this.el.sceneEl.is("help"));
        if (roomPropertiesReader.AllowPresentation) {
          this.transBtn.setAttribute("icon-button", "active", this.el.sceneEl.is("translation"));
          this.askBtn.setAttribute("icon-button", "active", this.el.sceneEl.is("handraise"));
        }
      });
    };

    this.onStateChange = evt => {
      console.log(evt.detail);
      if (
        !(
          evt.detail === "frozen" ||
          evt.detail === "pen" ||
          evt.detail === "camera" ||
          evt.detail === "agent" ||
          evt.detail === "map" ||
          evt.detail === "panel" ||
          evt.detail === "translation" ||
          evt.detail === "handraise" ||
          evt.detail === "help" ||
          evt.detail === "task"
        )
      )
        return;
      this.updateButtonStates();
    };

    this.onMicClick = () => {
      APP.mediaDevicesManager.toggleMic();
    };

    this.onSpawnClick = () => {
      if (!window.APP.hubChannel.can("spawn_and_move_media")) return;
      this.el.emit("action_spawn");
    };

    this.onAgentClick = () => {
      if (!roomPropertiesReader.AllowsAgent) return;
      this.el.sceneEl.emit("agent-toggle");
    };

    this.onMapClick = () => {
      if (!roomPropertiesReader.AllowsMap) return;
      this.el.emit("map-toggle");
    };

    this.onHelpClick = () => {
      if (!roomPropertiesReader.AllowsHelp) return;
      this.el.emit("help-toggle");
    };

    this.onTransClick = () => {
      if (!roomPropertiesReader.AllowPresentation) return;
      this.el.emit("toggle_translation");
    };

    this.onTaskClick = () => {
      this.el.emit("task-toggle");
    };

    this.onAskClick = () => {
      if (!roomPropertiesReader.AllowPresentation) return;
      this.el.emit("ask-toggle");
    };

    this.onPenClick = e => {
      if (!window.APP.hubChannel.can("spawn_drawing")) return;
      this.el.emit("spawn_pen", { object3D: e.object3D });
      this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_SPAWN_PEN);
    };

    this.onCameraClick = () => {
      if (!window.APP.hubChannel.can("spawn_camera")) return;
      this.el.emit("action_toggle_camera");
    };

    this.onInviteClick = () => {
      this.el.emit("action_invite");
    };
  },

  play() {
    this.el.sceneEl.addEventListener("stateadded", this.onStateChange);
    this.el.sceneEl.addEventListener("stateremoved", this.onStateChange);
    this.el.sceneEl.addEventListener("room_properties_updated", this.updateButtonStates);
    this.el.sceneEl.systems.permissions.onPermissionsUpdated(this.updateButtonStates);
    this.updateButtonStates();
    this.mic.object3D.addEventListener("interact", this.onMicClick);
    this.agentBtn.object3D.addEventListener("interact", this.onAgentClick);
    this.mapBtn.object3D.addEventListener("interact", this.onMapClick);
    this.helpBtn.object3D.addEventListener("interact", this.onHelpClick);
    this.transBtn.object3D.addEventListener("interact", this.onTransClick);
    this.askBtn.object3D.addEventListener("interact", this.onAskClick);
  },

  pause() {
    this.el.sceneEl.removeEventListener("stateadded", this.onStateChange);
    this.el.sceneEl.removeEventListener("stateremoved", this.onStateChange);
    this.el.sceneEl.removeEventListener("room_properties_updated", this.updateButtonStates);
    window.APP.hubChannel.removeEventListener("permissions_updated", this.updateButtonStates);
    this.el.sceneEl.removeEventListener("hub_updated", this.onHubUpdated);
    this.mic.object3D.removeEventListener("interact", this.onMicClick);
    this.agentBtn.object3D.removeEventListener("interact", this.onAgentClick);
    this.mapBtn.object3D.removeEventListener("interact", this.onMapClick);
    this.helpBtn.object3D.removeEventListener("interact", this.onHelpClick);
    this.transBtn.object3D.removeEventListener("interact", this.onTransClick);
    this.askBtn.object3D.removeEventListener("interact", this.onAskClick);
  }
});

/**
 * Registers a click handler and invokes the block method on the NAF adapter for the owner associated with its entity.
 * @namespace network
 * @component translate-panel
 */

import { Vector3 } from "three";
import { translationSystem } from "../bit-systems/translation-system";
import { roomPropertiesReader } from "../utils/rooms-properties";

const PANEL_PADDING = 0.05;

AFRAME.registerComponent("translate-panel", {
  async init() {
    this.translateText = this.el.querySelector(".translate-text").object3D;
    this.translateBackground = this.el.querySelector(".translate-background").object3D;

    this.updateTextSize = this.updateTextSize.bind(this);
    this.fortmatLines = this.fortmatLines.bind(this);
    this.onTargetUpdate = this.onTargetUpdate.bind(this);

    NAF.utils
      .getNetworkedEntity(this.el)
      .then(networkedEl => {
        this.playerSessionId = NAF.utils.getCreator(networkedEl);
        this.owner = networkedEl.components.networked.data.owner;
      })
      .catch(error => console.log(error));

    this.size = new Vector3();
    this.preformatText;
    this.formattedText;
    this.targetLanguage = false;

    NAF.utils
      .getNetworkedEntity(this.el)
      .then(networkedEl => {
        this.owner = networkedEl.components.networked.data.owner;
      })
      .catch(error => {
        console.error(error);
      });

    this.onAvailableTranslation = ({ detail: response }) => {
      if (response.id === this.owner) this.UpdateText(response.text);
    };

    this.el.object3D.visible = false;
    await roomPropertiesReader.waitForProperties();
    this.panelAllowed = roomPropertiesReader.AllowTrans && roomPropertiesReader.transProps.panel.type === "avatar";
    if (this.panelAllowed) {
      this.el.sceneEl.addEventListener("translation_updates_applied", this.onTargetUpdate);
    }
  },

  UpdateText(text) {
    if (!text) return;
    this.preformatText = text;
    this.fortmatLines();
    this.translateText.el.addEventListener("text-updated", this.updateTextSize);
    this.translateText.el.setAttribute("text", {
      value: this.formattedText
    });
  },

  updateTextSize() {
    this.translateText.el.components["text"].getSize(this.size);
    this.translateBackground.el.setAttribute("slice9", {
      width: this.size.x + PANEL_PADDING * 2,
      height: this.size.y + PANEL_PADDING * 2
    });
  },

  fortmatLines() {
    const lines = this.preformatText.split(/\s+/);
    const line_size = lines.length;
    const maxStep = 7;
    const step = line_size / 2 > maxStep ? maxStep : line_size > 3 ? Math.ceil(line_size / 2) : line_size;
    this.formattedText = lines.map((word, index) => (index % step === step - 1 ? word + "\n" : word)).join(" ");
  },

  onTargetUpdate({ detail: updates }) {
    if (updates.id !== this.owner) return;

    const show = updates.type === "add";
    if (show && !this.el.object3D.visible) {
      this.el.sceneEl.addEventListener("translation_available", this.onAvailableTranslation);
      this.UpdateText(GreetingPhrases[translationSystem.mylanguage]);
    } else if (!show) this.el.sceneEl.removeEventListener("translation_available", this.onAvailableTranslation);

    this.el.object3D.visible = show;
  }
});

export const GreetingPhrases = {
  spanish: "La traducción se mostrará aquí",
  italian: "La traduzione verrà mostrata qui",
  greek: "Η μετάφραση θα εμφανιστεί εδώ",
  dutch: "De vertaling wordt hier getoond",
  german: "Die Übersetzung wird hier angezeigt",
  english: "The translation will be displayed here"
};

import React, { useState } from "react";
import { ToolbarButton } from "../input/ToolbarButton";
import { ReactComponent as TranslateIcon } from "../icons/Translate.svg";
import { FormattedMessage, defineMessage, useIntl } from "react-intl";
import { ToolTip } from "@mozilla/lilypad-ui";
import { roomPropertiesReader } from "../../utils/rooms-properties";
import { translationSystem } from "../../bit-systems/translation-system";

const TranslateTooltipDescription = defineMessage({
  id: "translate-tooltip.description",
  defaultMessage: "Toggle Translation"
});

export function TranslateButton({ scene }) {
  const shouldExist =
    roomPropertiesReader.AllowTrans &&
    (roomPropertiesReader.transProps.conversation.type === "presentation" ||
      roomPropertiesReader.transProps.conversation.type === "duo");

  if (shouldExist) {
    const [active, setActive] = useState(translationSystem.active);
    const intl = useIntl();
    const description = intl.formatMessage(TranslateTooltipDescription);

    const clickCallback = () => {
      scene.emit("toggle_translation");
    };

    const activateButton = () => {
      setActive(scene.is("translation"));
    };

    window.addEventListener("toggle_translation", activateButton);

    return (
      <ToolTip description={description}>
        <ToolbarButton
          onClick={clickCallback}
          selected={active}
          icon={<TranslateIcon />}
          preset="accent5"
          label={<FormattedMessage id="translate-toolbar-button" defaultMessage="Translate" />}
        />
      </ToolTip>
    );
  }

  return null;
}

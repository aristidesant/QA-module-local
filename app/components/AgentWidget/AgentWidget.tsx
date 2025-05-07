"use client";
import React, { useEffect, useRef } from "react";

interface AgentWidgetProps {
  agentId: string;
}

const AgentWidget: React.FC<AgentWidgetProps> = ({ agentId }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Inject only the custom element
      containerRef.current.innerHTML = `<elevenlabs-convai agent-id="${agentId}"></elevenlabs-convai>`;
    }

    // Dynamically add the script once
    if (!document.getElementById("elevenlabs-convai-script")) {
      const script = document.createElement("script");
      script.id = "elevenlabs-convai-script";
      script.src = "https://elevenlabs.io/convai-widget/index.js";
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);
    }
  }, [agentId]);

  return <div id="agent-widget-id" ref={containerRef} />;
};

export default AgentWidget;

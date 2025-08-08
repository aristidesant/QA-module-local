export const educationForm = {
  type: "EDUCATION",
  fields: [
    {
      label: "Context",
      name: "context",
      placeholder: "E.g., course selection, exam schedule, pensum details",
      required: true,
      description:
        "Briefly describe the academic scenario or type of inquiry (e.g., course selection, exam schedules, pensum details).",
      type: "text",
    },
    {
      label: "Question Type",
      name: "questionType",
      placeholder: "Academic, administrative, or general information",
      required: true,
      description:
        "Specify if the question is academic (subject-related), administrative (pensum, enrollment), or general information.",
      type: "text",
    },
    {
      label: "Student Profile",
      name: "studentProfile",
      placeholder: "E.g., student, parent, teacher; grade or major",
      required: true,
      description:
        "Define the user’s role (student, parent, teacher) and relevant background (e.g., grade, major).",
      type: "text",
    },
    {
      label: "Information Needed",
      name: "informationNeeded",
      placeholder: "E.g., syllabus details, prerequisites, policies",
      required: true,
      description:
        "Clearly state what information or assistance is required (e.g., syllabus details, course prerequisites, academic policies).",
      type: "text",
    },
    {
      label: "Tone and Formality",
      name: "toneFormality",
      placeholder: "Formal, friendly, concise, etc.",
      required: true,
      description:
        "Indicate the desired tone (formal, friendly, concise) for the AI’s response.",
      type: "text",
    },
    {
      label: "Additional Notes",
      name: "additionalNotes",
      placeholder: "Any extra context or instructions",
      required: false,
      description:
        "Add any specific instructions or context that could help the AI provide a more accurate answer.",
      type: "text",
    },
  ],
};

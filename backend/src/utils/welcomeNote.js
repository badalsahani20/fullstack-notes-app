export const getWelcomeNote = () => ({
  title: "Welcome to Notesify! 🚀",
  content: `
    <h1>Welcome to Notesify! 🚀</h1>
    <p>Hello! We're thrilled to have you here. This app is designed to help you capture ideas, organize your thoughts, and leverage the power of AI to improve your writing.</p>

    <h3>Your Getting Started Checklist:</h3>
    <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false">
            <p><strong>Create your first folder:</strong> Click the <strong>"+"</strong> icon next to Notebooks in the sidebar to organize your space.</p>
        </li>
        <li data-type="taskItem" data-checked="false">
            <p><strong>Try AI Assistance:</strong> Highlight any sentence and use the AI menu to summarize or fix grammar. ✨</p>
        </li>
        <li data-type="taskItem" data-checked="false">
            <p><strong>Favorite an important note:</strong> Click the star icon ⭐ on any note to keep it in your favorites list.</p>
        </li>
        <li data-type="taskItem" data-checked="false">
            <p><strong>Drag & Drop to Folder:</strong> Try picking up this note from the list and dragging it onto a Notebook in the sidebar! 🖱️</p>
        </li>
        <li data-type="taskItem" data-checked="false">
            <p><strong>Explore Archive & Trash:</strong> Clean up your workspace without losing data. You can always restore from the Archive or Trash.</p>
        </li>
    </ul>

    <p><em>Tip: You can click the checkboxes above to track your progress!</em></p>
    <p>Feel free to delete this note once you've explored all the features. Happy note-taking!</p>
  `,
});

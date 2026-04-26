export const getWelcomeNote = () => ({
  title: "Welcome to Notesify! 🚀",
  content: `
    <h1>Welcome to Notesify! 🚀</h1>
    <p>Hello! We're thrilled to have you here. This app is designed to help you capture ideas, organize your thoughts, and leverage the power of AI to <strong>supercharge your workflow</strong>.</p>

    <p><mark data-color="#fef08a"><strong>Pro Tip:</strong> This note itself is a showcase of what you can build!</mark></p>

    <h3>1. Interactive Checklists 📋</h3>
    <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false"><p>Create your first folder in the sidebar</p></li>
        <li data-type="taskItem" data-checked="true"><p>Explore the rich text formatting (you are doing this now!)</p></li>
        <li data-type="taskItem" data-checked="false"><p>Try the <strong>"Ask AI"</strong> button for smart editing</p></li>
    </ul>

    <h3>2. High-Fidelity Code Blocks 💻</h3>
    <p>Notesify features a powerful syntax highlighting engine for developers. Try pasting some code!</p>
    <pre><code class="language-javascript">function welcomeUser(name) {
  console.log(\`Hello, \${name}! Welcome to the future of notes.\`);
  return { status: "productive", mood: "inspired" };
}</code></pre>

    <h3>3. Structured Data with Tables 📊</h3>
    <table>
      <tbody>
        <tr>
          <th>Feature</th>
          <th>Standard Notes</th>
          <th>Notesify</th>
        </tr>
        <tr>
          <td>AI Integration</td>
          <td>❌ None</td>
          <td>✅ Iris Multimodal AI</td>
        </tr>
        <tr>
          <td>Visualizations</td>
          <td>❌ Static</td>
          <td>✅ Dynamic Charts & Mermaid</td>
        </tr>
        <tr>
          <td>Organization</td>
          <td>Basic Folders</td>
          <td>Smart Notebooks + Drag & Drop</td>
        </tr>
      </tbody>
    </table>

    <h3>4. Multimodal AI Power ✨</h3>
    <blockquote>
      "The best way to predict the future is to create it." — <strong>Peter Drucker</strong>
    </blockquote>
    <p>Use the <strong>Contextual AI Panel</strong> on the right to chat with your note. You can ask it to:</p>
    <ul>
      <li><em>"Create a Mermaid flowchart of my project structure"</em></li>
      <li><em>"Generate a bar chart comparing these table values"</em></li>
      <li><em>"Explain this code snippet in simple terms"</em></li>
    </ul>

    <p>Feel free to edit, highlight, or even delete this note once you've explored all the features. Happy note-taking!</p>
  `,
});

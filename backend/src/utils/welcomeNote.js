export const getWelcomeNote = () => ({
  title: "Welcome to Notesify! 🚀",
  content: `
    <h1>Wait, You Actually Signed Up? 🦄</h1>
    <p>Look at you, all ready to organize your life. I'm <strong>Notesify</strong>, and since you're here, I guess we're best friends now. <em>(Sorry, Netflix, you've been replaced.)</em></p>

    <p><mark data-color="#fef08a"><strong>Breaking the Fourth Wall:</strong> This note is basically a tech demo disguised as a greeting. Sneaky, right?</mark></p>

    <h3>1. The "Boring Admin" Checklist 📋</h3>
    <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false"><p>Create a <strong>Notebook</strong> (Because chaos is only cool in movies)</p></li>
        <li data-type="taskItem" data-checked="false"><p>Try <u>Drag-and-Drop</u> to move this note into a folder 🖱️</p></li>
        <li data-type="taskItem" data-checked="false"><p>Use <code>Ctrl + K</code> or the search bar to find your 3 AM ideas</p></li>
        <li data-type="taskItem" data-checked="true"><p>Read this masterpiece of an onboarding note</p></li>
    </ul>

    <h3>2. Nerdy Stuff (Skip if you're too cool) 💻</h3>
    <p>For the code-monkeys among us, we have high-fidelity syntax highlighting. It makes even bad code look like a masterpiece:</p>
    <pre><code class="language-javascript">// This code does absolutely nothing, but look how pretty it is
function breakTheFourthWall() {
  const userMood = "Inspired";
  console.log("I can see you through the screen. Nice shirt!");
  return { status: "Mind Blown", tools: ["Iris", "Tables", "Pizza"] };
}</code></pre>

    <h3>3. Me vs. The Other Guys 📊</h3>
    <p>Let's be real, you've tried others. Here's why you're staying here:</p>
    <table>
      <tbody>
        <tr>
          <th>Category</th>
          <th>Those "Other" Apps</th>
          <th>Notesify (The GOAT)</th>
        </tr>
        <tr>
          <td>Style</td>
          <td>Corporate Beige</td>
          <td>Pure Aesthetic Bliss</td>
        </tr>
        <tr>
          <td>AI Braingraph</td>
          <td>"I don't know her"</td>
          <td>Iris (She's a genius)</td>
        </tr>
        <tr>
          <td>Vibe Check</td>
          <td>📉 0%</td>
          <td>📈 1000%</td>
        </tr>
      </tbody>
    </table>

    <h3>4. My Imaginary Friend, Iris ✨</h3>
    <blockquote>
      "I'm not saying I'm a superhero, but have you ever seen me and Batman in the same room?"
    </blockquote>
    <p>On your right, there's a panel. That's <strong>Iris</strong>. She’s like a Jarvis, but with better jokes. Ask her to:</p>
    <ul>
      <li><em>"Turn this mess into a Mermaid flowchart"</em></li>
      <li><em>"Visualize my lack of productivity with a Bar Chart"</em></li>
      <li><em>"Explain why my code is failing (again)"</em></li>
    </ul>

    <p>Now go on, delete this note and write something that'll change the world. Or just a list of cat names. I don't judge. <strong>Happy Note-Taking!</strong></p>
  `,
});

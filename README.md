# FireSafe Solutions API - Complete Beginner's Guide

Welcome! This guide will teach you how to build a chatbot API from scratch. By the end, you'll have a working AI assistant that can answer questions about fire safety and FireSafe Solutions services.

## What Are We Building?

We're building a **backend API** - a program that runs on a server and responds to requests. Think of it like a waiter at a restaurant:
- Your React website (the customer) sends a request to the API (the waiter)
- The API talks to the AI (the kitchen)
- The API returns the response back to your website

## Key Concepts You'll Learn

- **Python**: A programming language that's easy to read and write
- **Flask**: A tool that helps us build web APIs in Python
- **Ollama**: A program that runs AI models on your computer
- **Virtual Environment**: A way to keep project dependencies separate
- **CORS**: A security feature that lets your website talk to this API
- **JSON**: A format for sending data between computers

---

## Step 1: Install Python

First, you need Python installed on your computer.

**On Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

**Check if it's installed:**
```bash
python3 --version
```

You should see something like `Python 3.8.0` or higher.

---

## Step 2: Install Ollama

Ollama is the program that runs the AI model. It's like having ChatGPT running on your own computer.

**Download and install Ollama:**
1. Go to [ollama.com](https://ollama.com)
2. Download the version for your operating system
3. Install it like any other program

**Verify Ollama is installed:**
```bash
ollama --version
```

**Pull the AI model we'll use:**
```bash
ollama pull qwen2.5:0.5b
```

This downloads the AI brain that will power our chatbot. We're using a smaller model (0.5 billion parameters) which is faster and uses less memory, perfect for running on your own computer.

---

## Step 3: Set Up Your Project Folder

Create a folder for your project and navigate into it:

```bash
mkdir fs-ollamaBot
cd fs-ollamaBot
```

---

## Step 4: Create a Virtual Environment

A virtual environment is like a sandbox for your project. It keeps all the tools (libraries) for this project separate from other projects. This prevents conflicts - like having different versions of the same tool for different projects.

**Create the virtual environment:**
```bash
python3 -m venv .venv
```

The `-m venv` means "use the venv module to create a virtual environment." `.venv` is the name of the folder it creates.

**Activate the virtual environment:**
```bash
source .venv/bin/activate
```

You'll see `(.venv)` appear at the start of your command prompt. This tells you the virtual environment is active.

**To deactivate later:**
```bash
deactivate
```

---

## Step 5: Install Dependencies

Dependencies are tools/libraries that our code needs to work. Instead of installing them manually, we list them in a file called `requirements.txt`.

**Create the `requirements.txt` file:**
```bash
nano requirements.txt
```

Paste this into the file:
```
Flask==3.1.3
flask-cors==5.0.1
ollama==0.6.2
```

Press `Ctrl+X`, then `Y`, then `Enter` to save and exit.

**What do these do?**
- **Flask**: The web framework that handles HTTP requests
- **flask-cors**: Allows websites from different domains to use our API
- **ollama**: Lets Python talk to the Ollama AI

**Install the dependencies:**
```bash
pip install -r requirements.txt
```

The `-r` means "read from this file." This installs everything listed in requirements.txt.

---

## Step 6: Create the Modelfile

The Modelfile tells Ollama how to customize the AI model - what it should know and how it should behave.

**Create the `Modelfile`:**
```bash
nano Modelfile
```

Paste this into the file:
```
FROM qwen2.5:0.5b

SYSTEM """
You are the AI assistant for FireSafe Solutions, a professional fire alarm installation and safety company.
Your job is to help visitors with questions about fire safety, our services, and our company.

=== ABOUT FIRESAFE SOLUTIONS ===
Company: FireSafe Solutions
Industry: Fire Alarm Installation & Safety Services
Service Area: Residential and commercial properties
Experience: 15+ years in fire safety systems

Services Offered:
- Fire Alarm Installation: Complete system design and professional installation
- 24/7 Monitoring: Continuous monitoring with emergency response coordination
- System Maintenance: Regular inspections, testing, and preventive maintenance
- Emergency Repairs: Rapid response for system failures and malfunctions
- System Upgrades: Modernizing outdated fire alarm systems
- Code Compliance: Professional assessments and safety planning

Products:
- Smart Smoke Detectors: Advanced photoelectric and ionization sensors with smartphone integration
- Commercial Fire Panels: Enterprise-grade addressable panels for commercial and industrial properties
- Wireless Fire Alarms: Easy-to-install wireless systems for retrofits and historic properties

Certifications & Compliance:
- Licensed & Insured
- NICET Certified technicians
- NFPA (National Fire Protection Association) compliant
- All local and national safety codes

Contact Information:
- Emergency Hotline: 1-800-FIRE-SAFE
- Email: info@firesafesolutions.com
- 24/7 emergency service available

=== YOUR BEHAVIOR ===
- Respond professionally and helpfully to questions about fire safety and our services
- Provide accurate information about fire alarm systems, installation, and maintenance
- Emphasize safety and the importance of proper fire protection
- If asked about pricing or specific quotes, direct them to contact us for a free consultation
- If asked something outside your knowledge base, say "For detailed information on that, please contact our team at 1-800-FIRE-SAFE"
- Keep responses concise, professional, and safety-focused
- Do not proactively greet visitors - wait for their questions
"""

PARAMETER temperature 0.6
PARAMETER num_ctx 4096
PARAMETER top_p 0.85
```

Save and exit (`Ctrl+X`, `Y`, `Enter`).

**Build the custom model:**
```bash
ollama create firesafe-bot -f Modelfile
```

This creates a custom model named `firesafe-bot` based on the AI model we pulled earlier, but with FireSafe Solutions' information baked in.

---

## Step 7: Create the Flask Application

Now we'll write the Python code that powers our API.

**Create `app.py`:**
```bash
nano app.py
```

Paste this code:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import ollama

# Create a Flask app - this is our web server
app = Flask(__name__)

# Enable CORS - this lets React websites use our API
CORS(app)

# This dictionary stores conversation history for each user session
# Format: {"session_id": [{"role": "user", "content": "message"}, ...]}
CHAT_HISTORY = {}

@app.route("/", methods=["GET"])
def health():
    """Health check endpoint - returns success when API is running"""
    return jsonify({
        "status": "success",
        "message": "FireSafe Solutions API is running",
        "service": "FireSafe Solutions Chatbot API"
    })

@app.route("/chat", methods=["POST"])
def chat():
    """
    This function handles POST requests to /chat
    When someone sends a message, this function:
    1. Gets the message and session ID
    2. Adds the message to conversation history
    3. Sends it to the AI
    4. Returns the AI's response
    """
    
    # Get the data sent in the request
    data = request.json
    
    # Extract session_id (defaults to "default" if not provided)
    session_id = data.get("session_id", "default")
    
    # Extract the user's message
    user_message = data.get("message", "")
    
    # If this is a new session, create an empty history list
    if session_id not in CHAT_HISTORY:
        CHAT_HISTORY[session_id] = []
    
    # Add the user's message to the conversation history
    CHAT_HISTORY[session_id].append({
        "role": "user",
        "content": user_message
    })
    
    # Send the conversation to Ollama and get a response
    response = ollama.chat(
        model="firesafe-bot",  # Use our custom model
        messages=CHAT_HISTORY[session_id]
    )
    
    # Extract the AI's reply from the response
    assistant_reply = response["message"]["content"]
    
    # Add the AI's reply to the conversation history
    CHAT_HISTORY[session_id].append({
        "role": "assistant",
        "content": assistant_reply
    })
    
    # Return the reply as JSON
    return jsonify({"reply": assistant_reply})

# This runs the app when you execute the file
if __name__ == "__main__":
    app.run(debug=True, port=5000)
```

Save and exit.

---

## Step 8: Run Your API

**Start the server:**
```bash
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

Your API is now running! Leave this terminal window open.

**Verify it's working:**
Open your browser and go to `http://localhost:5000/` - you should see:
```json
{
  "status": "success",
  "message": "FireSafe Solutions API is running",
  "service": "FireSafe Solutions Chatbot API"
}
```

---

## Step 9: Test Your API

Open a new terminal window (keep the first one running) and test it with curl:

```bash
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-user",
    "message": "What services do you offer?"
  }'
```

You should get a response like:
```json
{"reply":"FireSafe Solutions offers fire alarm installation, 24/7 monitoring, system maintenance, emergency repairs, system upgrades, and code compliance services."}
```

**What just happened?**
1. We sent a POST request to `http://localhost:5000/chat`
2. We included JSON data with a session ID and message
3. The Flask app received the request
4. It sent the message to the Ollama AI
5. The AI responded using the information from the Modelfile
6. The Flask app sent the response back as JSON

---

## Understanding the Code

Let's break down what each part of `app.py` does:

### Imports
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import ollama
```
These lines bring in tools we need:
- `Flask`: The main web framework
- `request`: To get data sent to our API
- `jsonify`: To convert Python data to JSON
- `CORS`: To allow cross-origin requests
- `ollama`: To talk to the AI

### Creating the App
```python
app = Flask(__name__)
CORS(app)
```
- `Flask(__name__)` creates the web application
- `CORS(app)` enables CORS so other websites can use our API

### The Route
```python
@app.route("/chat", methods=["POST"])
def chat():
```
- `@app.route` is a "decorator" - it tells Flask "this function handles requests to /chat"
- `methods=["POST"]` means this only accepts POST requests (for sending data)

### Handling the Request
```python
data = request.json
session_id = data.get("session_id", "default")
user_message = data.get("message", "")
```
- `request.json` gets the JSON data sent in the request
- `.get()` safely retrieves values, with a default if not found

### Conversation History
```python
if session_id not in CHAT_HISTORY:
    CHAT_HISTORY[session_id] = []
```
This creates a new conversation history for each unique session ID. This way, different users have separate conversations.

### Calling the AI
```python
response = ollama.chat(
    model="firesafe-bot",
    messages=CHAT_HISTORY[session_id]
)
```
This sends the entire conversation history to the AI so it can contextually respond.

### Returning the Response
```python
return jsonify({"reply": assistant_reply})
```
`jsonify()` converts a Python dictionary to JSON format for the HTTP response.

---

## Line-by-Line Code Explanation

Alright, let's walk through every line of code together. I'll explain what each part does in plain English.

### Import Statements (Lines 1-3)

**Line 1:** `from flask import Flask, request, jsonify`
So we're importing three things from Flask here. Think of it like grabbing the tools you need before you start working. We've got:
- `Flask`: This is the main thing that creates our web server - it's basically the foundation
- `request`: This lets us get data that people send to our API - like when someone types a message
- `jsonify`: This converts our Python data into JSON so we can send it back to the browser

**Line 2:** `from flask_cors import CORS`
Now we're importing CORS. I know that sounds super technical, but here's the deal: browsers normally block websites from talking to each other for security. CORS is like giving permission - it tells the browser "hey, it's cool if our React site talks to this Flask API." Without this, your chat wouldn't work because the browser would block it.

**Line 3:** `import ollama`
This imports the ollama library, which is how our Python code talks to the AI model running on your computer. Think of ollama as a translator - it takes your Python code and turns it into something the AI can understand.

### App Setup (Lines 5-6)

**Line 5:** `app = Flask(__name__)`
Alright, now we're actually creating our Flask app. This line makes a new web server and puts it in a variable called `app`. The `__name__` thing is just Python asking "what's this file called?" Flask needs that to know where to find stuff like templates. Basically, this line turns on the web server.

**Line 6:** `CORS(app)`
Remember that CORS stuff I was talking about? This is where we actually use it. We're giving our `app` to CORS so it knows to let other websites talk to it. This is how your React frontend (on port 5173) can talk to your Flask backend (on port 5000). Without this, the browser would block everything for security.

### Data Storage (Lines 8-10)

**Line 8:** `# This dictionary stores conversation history for each user session`
This is just a comment - anything after `#` gets ignored by Python. Comments are like notes to yourself explaining what's going on.

**Line 9:** `# Format: {"session_id": [{"role": "user", "content": "message"}, ...]}`
Another comment showing what the data will look like. Basically: each user (with a session_id) has a list of messages, and each message has who sent it (role) and what they said (content).

**Line 10:** `CHAT_HISTORY = {}`
We're making an empty dictionary called `CHAT_HISTORY`. Think of it like a real dictionary - you look up a word and get its definition. Here, the "word" is the session_id (like "user-123") and the "definition" is that user's chat history. We start empty and fill it up as people chat.

### Health Check Endpoint (Lines 12-20)

**Line 12:** `@app.route("/", methods=["GET"])`
This is a decorator - it's a special Python thing that modifies the function below it. Think of it like putting a sticky note on a function that says "when someone visits the homepage, run this." The `methods=["GET"]` part means this only handles GET requests, which are for getting data (like loading a page).

**Line 13:** `def health():`
Now we're defining the function that handles homepage requests. We called it `health` because it checks if our API is running. Functions in Flask that handle requests are called "view functions" - they look at the request and decide what to send back.

**Line 14:** `"""Health check endpoint - returns success when API is running"""`
This is a docstring - basically a longer comment describing what the function does. It's helpful for documentation and for other developers (or future you) to understand what's going on.

**Line 15:** (empty line)
Just a blank line to keep things readable.

**Line 16:** `return jsonify({`
Here we start sending data back. `return` means "send this back." We use `jsonify` to turn our Python data into JSON (which browsers understand). The `{` starts a dictionary - like a JSON object with key-value pairs.

**Line 17:** `"status": "success",`
We're adding the first piece of data. The key is "status" and the value is "success." This tells whoever asked that everything's working.

**Line 18:** `"message": "FireSafe Solutions API is running",`
Now we add a human-readable message. This is helpful for debugging - if someone visits this URL, they see a friendly message instead of technical codes.

**Line 19:** `"service": "FireSafe Solutions Chatbot API"`
This identifies which service is running. Useful if you have multiple APIs on the same server - helps tell them apart.

**Line 20:** `})`
We close the dictionary with `}` and the jsonify function with `)`. The data is now ready to send back to the browser as JSON.

### Chat Endpoint - Function Definition (Lines 22-32)

**Line 22:** `@app.route("/chat", methods=["POST"])
This is another decorator, like the one before. This time it's for the `/chat` URL. Notice we're using `methods=["POST"]` instead of GET. POST is for sending data to the server (like when someone types a message). Think of GET as "I want to see something" and POST as "I want to send something."

**Line 23:** `def chat():`
This is the function that handles chat requests. Whenever someone sends a message to our API, this function runs.

**Lines 24-31:** `"""..."""`
This is a docstring explaining what the function does. It breaks down the process: get the message, add it to history, send it to the AI, and return the response. Good for documentation.

**Line 32:** (empty line)
Blank line to keep things clean.

### Extracting Request Data (Lines 33-41)

**Line 33:** `# Get the data sent in the request`
Comment explaining what we're about to do.

**Line 34:** `data = request.json`
Now we're getting the data that was sent to us. The `request.json` part grabs the JSON data from the request. If someone sent `{"message": "hello"}`, then `data` becomes that dictionary. It's like opening an envelope to see what's inside.

**Line 35:** (empty line)
Blank line.

**Line 36:** `# Extract session_id (defaults to "default" if not provided)`
Comment explaining the next step.

**Line 37:** `session_id = data.get("session_id", "default")`
We're getting the session_id from the data. The `.get()` method is a safe way to get values - it has a backup. If "session_id" doesn't exist, it uses "default" instead. This prevents crashes if someone forgets to send a session ID. Like having a spare key.

**Line 38:** (empty line)
Blank line.

**Line 39:** `# Extract the user's message`
Comment explaining we're getting the message.

**Line 40:** `user_message = data.get("message", "")`
Similar to the previous line, but getting the "message" field. If no message was sent, we default to an empty string. This stores whatever the user typed.

**Line 41:** (empty line)
Blank line.

### Managing Conversation History (Lines 42-51)

**Line 42:** `# If this is a new session, create an empty history list`
Comment explaining what we're checking for.

**Line 43:** `if session_id not in CHAT_HISTORY:`
This is an if statement checking a condition. We're asking: "Is this session_id already in our CHAT_HISTORY dictionary?" If this is the first time this user has chatted, the answer is no (True), and the code inside runs.

**Line 44:** `CHAT_HISTORY[session_id] = []`
This only runs if it's a new user. We're creating an empty list `[]` for this user in our dictionary. Like giving a new student a blank notebook.

**Line 45:** (empty line)
Blank line.

**Line 46:** `# Add the user's message to the conversation history`
Comment explaining the next action.

**Line 47:** `CHAT_HISTORY[session_id].append({`
Now we're adding the user's message to their history. We access their list using `CHAT_HISTORY[session_id]`, then use `.append()` to add to the end. The `{` starts a new dictionary for this message.

**Line 48:** `"role": "user",`
We're adding a "role" field to tell us who sent the message - in this case, the user. The AI needs to know this to understand the conversation.

**Line 49:** `"content": user_message`
Now we add the actual message content - the text the user typed, which we stored earlier.

**Line 50:** `})`
We close the dictionary and the append function. The message is now added to the history!

**Line 51:** (empty line)
Blank line.

### Calling the AI (Lines 52-57)

**Line 52:** `# Send the conversation to Ollama and get a response`
Comment explaining we're about to talk to the AI.

**Line 53:** `response = ollama.chat(`
Here's where we actually call the AI. We use `ollama.chat()` to send the conversation to the AI model. The AI's response gets stored in `response`. The `(` starts the function call.

**Line 54:** `model="firesafe-bot",  # Use our custom model`
We're telling ollama which AI model to use. "firesafe-bot" is the custom model we created with the Modelfile - it has all the FireSafe info baked in.

**Line 55:** `messages=CHAT_HISTORY[session_id]`
We're sending the entire conversation history to the AI. This is important because it gives the AI context - it can see what was said before. Without this, the AI wouldn't remember previous messages.

**Line 56:** `)`
We close the function call. The request is sent to the AI, and we're waiting for a response.

**Line 57:** (empty line)
Blank line.

### Processing the AI Response (Lines 58-66)

**Line 58:** `# Extract the AI's reply from the response`
Comment explaining we're getting the AI's actual text response.

**Line 59:** `assistant_reply = response["message"]["content"]`
The response from ollama is a complex dictionary with lots of info. We're drilling down to get just the text of the AI's reply. First we access `response["message"]`, then `["content"]`. It's like opening a box inside a box. We store this text in `assistant_reply`.

**Line 60:** (empty line)
Blank line.

**Line 61:** `# Add the AI's reply to the conversation history`
Comment explaining we're saving the AI's response.

**Line 62:** `CHAT_HISTORY[session_id].append({`
Just like with the user's message, we're adding the AI's response to the history. We use `.append()` to add it to the end of the list.

**Line 63:** `"role": "assistant",`
We set the role to "assistant" to show this came from the AI. This helps track who said what.

**Line 64:** `"content": assistant_reply`
The content is the actual text of the AI's response, which we extracted earlier.

**Line 65:** `})`
We close the dictionary and the append call. The AI's response is now saved!

**Line 66:** (empty line)
Blank line.

### Returning the Response (Lines 67-68)

**Line 67:** `# Return the reply as JSON`
Comment explaining we're sending the response back.

**Line 68:** `return jsonify({"reply": assistant_reply})`
Now we're sending the AI's response back. We create a dictionary with "reply" containing the AI's text. `jsonify()` converts this to JSON, and `return` sends it back. The circle is complete - we got a message, processed it, and now we're sending the answer back!

### Running the App (Lines 70-72)

**Line 70:** `# This runs the app when you execute the file`
Comment explaining this is the startup code.

**Line 71:** `if __name__ == "__main__":`
This is a special Python pattern you'll see a lot. `__name__` is a variable Python sets automatically. When you run the file directly (like `python app.py`), `__name__` equals `"__main__"`. But if you import this file, `__name__` equals the module name. This check ensures the server only starts when you run the file directly, not when importing it. Like a security guard checking if you're supposed to be there.

**Line 72:** `app.run(debug=True, port=5000)`
Finally, we start the Flask server! `app.run()` launches the web server. `debug=True` means we're in development mode - the server auto-reloads if we change code, and shows detailed error messages. `port=5000` tells it to listen on port 5000, so you can access it at http://localhost:5000. When you deploy this to production, you'd change `debug=True` to `debug=False` for security.

---

## Using This API in a React App

Here's how a React frontend would call this API:

```javascript
// Function to send a message to the API
const sendMessage = async (message, sessionId) => {
  try {
    const response = await fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        message: message,
      }),
    });

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Example usage
sendMessage("What services do you offer?", "user-123")
  .then(reply => console.log(reply));
```

---

# React Frontend - Complete Beginner's Guide

Now that you have the backend API running, let's build a beautiful React frontend to interact with it. This guide will teach you how to create a modern web application even if you've never used React before.

## What Are We Building?

We're building a **frontend web application** - the part of the website that users see and interact with in their browser. Think of it like:
- The backend API is the kitchen (does the work)
- The React frontend is the dining room (where customers sit and order)

## Key Concepts You'll Learn

- **React**: A JavaScript library for building user interfaces
- **TypeScript**: JavaScript with type checking (catches errors before they happen)
- **Vite**: A fast build tool for modern web development
- **Components**: Reusable building blocks of React apps
- **State**: Data that changes over time in your app
- **Hooks**: Special functions that let you use React features
- **CSS Modules**: Scoped styling for your components

---

## Step 1: Install Node.js

React requires Node.js, which is a JavaScript runtime that lets you run JavaScript outside the browser.

**Check if Node.js is installed:**
```bash
node --version
```

If you see a version number (like `v20.x.x`), you're good to go!

**If not installed:**
- Go to [nodejs.org](https://nodejs.org)
- Download the LTS (Long Term Support) version
- Install it like any other program

---

## Step 2: Navigate to the Client Folder

The frontend code lives in the `client/` folder:

```bash
cd client
```

---

## Step 3: Install Dependencies

Just like the Python backend had a `requirements.txt`, the React frontend has a `package.json` file that lists all the tools it needs.

**Install the dependencies:**
```bash
npm install
```

This reads the `package.json` file and downloads everything listed there.

**What does this install?**
- **react**: The core React library
- **react-dom**: React's DOM renderer (for web browsers)
- **typescript**: The TypeScript compiler
- **vite**: The build tool (super fast!)
- And several development tools for linting and type checking

---

## Step 4: Understand the Project Structure

Let's look at what's in the `client/` folder:

```
client/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── LandingPage.tsx
│   │   ├── LandingPage.css
│   │   ├── ChatbotWidget.tsx
│   │   └── ChatbotWidget.css
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── vite.config.ts       # Vite build config
```

**Key files explained:**
- `index.html`: The HTML file that loads in the browser (has a `<div id="root"></div>` where React renders)
- `main.tsx`: The entry point - it takes the `App` component and renders it into the HTML
- `App.tsx`: The main component that holds everything together
- `components/`: Individual pieces of UI (like LEGO blocks)

---

## Step 5: Run the Development Server

**Start the React app:**
```bash
npm run dev
```

You should see something like:
```
  VITE v8.0.14  ready in 127 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and go to `http://localhost:5173/`

You should see the FireSafe Solutions landing page!

**What's happening?**
- Vite starts a development server
- It watches your files for changes
- When you save a file, it automatically reloads the browser
- The page is running on port 5173 (React's default)

---

## Step 6: Understanding the React Code

Let's break down the key files:

### main.tsx - The Entry Point
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**What this does:**
1. Finds the `<div id="root">` in index.html
2. Creates a React "root" there
3. Renders the `<App />` component into that root

### App.tsx - The Main Component
```typescript
import { useState } from 'react';
import LandingPage from './components/LandingPage';
import ChatbotWidget from './components/ChatbotWidget';
import './index.css';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <LandingPage onOpenChat={() => setIsChatOpen(true)} />
      <ChatbotWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      {!isChatOpen && (
        <button onClick={() => setIsChatOpen(true)}>
          Open Chat
        </button>
      )}
    </>
  );
}

export default App;
```

**Key concepts:**
- `useState`: A React hook that lets you add state to components
- `isChatOpen`: A piece of state that tracks if the chat is open
- `setIsChatOpen`: A function to update that state
- Components return JSX (HTML-like syntax)

### LandingPage.tsx - The Landing Page Component
This is a larger component that displays the business landing page. It:
- Has a navigation bar
- Shows a hero section with stats
- Displays services and products
- Has a contact section
- Uses smooth scrolling for navigation

**Key patterns used:**
- `useEffect` for scroll detection (adds shadow to navbar when scrolled)
- `useRef` to reference DOM elements
- Inline SVG icons (no external icon library needed)
- CSS modules for styling

### ChatbotWidget.tsx - The Chat Interface
This component handles the chat interface:
- Shows/hides based on `isOpen` prop
- Sends messages to the backend API
- Displays conversation history
- Handles loading states

**How it calls the API:**
```typescript
const response = await fetch('http://localhost:5000/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: sessionId,
    message: userMessage,
  }),
});
```

---

## Frontend Line-by-Line Code Explanation

Now let's go through the React frontend code. I'll explain what each part does in plain English.

### main.tsx - The Entry Point (Lines 1-11)

**Line 1:** `import { StrictMode } from 'react'`
We're importing StrictMode from React. Think of it like a strict teacher - it checks your work carefully and points out problems. It only runs during development and helps catch bugs early.

**Line 2:** `import { createRoot } from 'react-dom/client'`
This imports the `createRoot` function, which is how we attach our React app to the HTML page. This is the modern way in React 18+. Think of it like planting a tree in a specific spot.

**Line 3:** `import './index.css'`
We're importing our global CSS file. This applies styles to the whole app. In React, we import CSS files just like JavaScript files - this makes sure the styles get included when we build.

**Line 4:** `import App from './App.tsx'`
We're importing the main App component. This is the root component - like the trunk of a tree that everything else branches from. The `.tsx` extension means it's a TypeScript React file (TypeScript adds type checking).

**Line 5:** (empty line)
Blank line to keep things organized.

**Line 6:** `createRoot(document.getElementById('root')!).render(`
This is where the magic happens. `document.getElementById('root')` finds the HTML element with id="root" in your index.html. The `!` is TypeScript saying "I promise this won't be null" - like telling TypeScript "trust me, this exists." Then `createRoot()` creates a React root there, and `.render()` starts rendering our app.

**Line 7:** `<StrictMode>`
We're wrapping our app in StrictMode. This puts your app through extra checks and warns you about common mistakes. Really helpful during development.

**Line 8:** `<App />`
Here we're rendering the App component. This is the main component that contains everything else. The `/>` syntax is self-closing, like `<img />` in HTML.

**Line 9:** `</StrictMode>`
We close the StrictMode wrapper. Everything inside gets the extra checks.

**Line 10:** `)`
We close the render function call. Our React app is now being rendered into the HTML!

**Line 11:** (empty line)
Blank line.

### App.tsx - The Main Component (Lines 1-29)

**Line 1:** `import { useState } from 'react';`
We're importing the `useState` hook from React. Hooks are special functions that let you use React features. Think of hooks like tools in a toolbox - `useState` is for managing state (data that changes, like whether the chat is open).

**Line 2:** `import LandingPage from './components/LandingPage';`
We're importing the LandingPage component. This shows the main landing page with all the sections. The `./components/` path means it's in the components subfolder.

**Line 3:** `import ChatbotWidget from './components/ChatbotWidget';`
We're importing the ChatbotWidget component. This is the chat interface that users interact with.

**Line 4:** (empty line)
Blank line.

**Line 5:** (empty line)
Another blank line.

**Line 6:** `function App() {`
We're defining the App component as a function. This is the modern way to write React components. The function returns JSX (looks like HTML but is actually JavaScript) that describes what appears on screen.

**Line 7:** `const [isChatOpen, setIsChatOpen] = useState(false);`
This is how we use useState. It gives us two things: `isChatOpen` (the current value, starting as false) and `setIsChatOpen` (a function to update it). Think of it like a light switch - `isChatOpen` tells us if it's on, and `setIsChatOpen` flips the switch. We're tracking whether the chat is visible.

**Line 8:** (empty line)
Blank line.

**Line 9:** `return (`
React components always return something describing what to render. The `(` lets us spread this across multiple lines.

**Line 10:** `<>`
This is a React Fragment. It's like an invisible wrapper that groups elements without adding extra HTML. Like grouping items in a box without the box being visible.

**Line 11:** `<LandingPage onOpenChat={() => setIsChatOpen(true)} />`
We're rendering the LandingPage component. We're passing it a prop called `onOpenChat`. Props are how we pass data to components. The value is an arrow function that sets isChatOpen to true (opens the chat).

**Line 12:** `<ChatbotWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />`
Now we're rendering the ChatbotWidget. We pass two props: `isOpen` (whether the chat is open) and `onClose` (a function that closes the chat). The widget uses these to know when to show itself and how to close.

**Line 13:** `{!isChatOpen && (`
This is conditional rendering. The curly braces mean "evaluate as JavaScript." `!isChatOpen` means "if chat is NOT open." The `&&` means "and then." So this means "if the chat is closed, render what's inside." This shows the floating button only when the chat isn't open.

**Line 14:** `<button`
We're starting a button element - the floating chat button.

**Line 15:** `className="chat-button"`
In React we use `className` instead of `class` (because `class` is reserved in JavaScript). This applies the CSS class to style the button.

**Line 16:** `onClick={() => setIsChatOpen(true)}`
We're adding an onClick handler. When clicked, the arrow function runs and calls `setIsChatOpen(true)`, which opens the chat.

**Line 17:** `aria-label="Open chat"`
This is for accessibility - screen readers will read "Open chat" to visually impaired users.

**Line 18:** `>`
Closes the opening button tag.

**Line 19:** `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">`
We're adding an inline SVG icon. SVGs scale without losing quality. We're using inline SVG so we don't need an external icon library. The `viewBox` defines the coordinate system.

**Line 20:** `<path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>`
This is the icon shape - a chat bubble. The `d` attribute has the drawing instructions. `fill="currentColor"` makes it use the current text color.

**Line 21:** `</svg>`
We close the SVG.

**Line 22:** `</button>`
We close the button.

**Line 23:** `)}`
We close the conditional rendering. The `)` matches the opening `(` from line 13.

**Line 24:** `</>`
We close the React Fragment.

**Line 25:** `);`
We close the return statement.

**Line 26:** `}`
We close the App function.

**Line 27:** (empty line)
Blank line.

**Line 28:** `export default App;`
We're exporting the App component as the default export. This lets other files import it with `import App from './App'`.

**Line 29:** (empty line)
Blank line.

### ChatbotWidget.tsx - The Chat Interface (Lines 1-68)

**Line 1:** `import { useState, useRef, useEffect } from 'react';`
We're importing three React hooks. Hooks are special tools that let your function components do things they normally couldn't. `useState` manages data that changes, `useRef` lets us access HTML elements directly, and `useEffect` handles side effects (things outside React, like API calls).

**Line 2:** `import './ChatbotWidget.css';`
We're importing the CSS file for this component. This keeps the styling isolated to just this component, which helps prevent style conflicts.

**Line 3:** (empty line)
Blank line.

**Line 4:** `interface Message {`
We're defining a TypeScript interface called `Message`. Interfaces are like blueprints - they describe what shape data should have. This says "a Message must have these properties."

**Line 5:** `role: 'user' | 'assistant';`
The `role` can only be 'user' or 'assistant'. The `|` means "or" in TypeScript. This tells us who sent each message.

**Line 6:** `content: string;`
The `content` must be a string - the actual text of the message. TypeScript will error if we try to put anything else here.

**Line 7:** `}`
We close the interface. Now we have a blueprint for what a message looks like.

**Line 8:** (empty line)
Blank line.

**Line 9:** `interface ChatbotWidgetProps {`
Now we're defining the props interface. Props are how parent components pass data to child components. This says "these are the props this component accepts."

**Line 10:** `isOpen: boolean;`
The `isOpen` prop must be true or false. This controls whether the chat widget is visible.

**Line 11:** `onClose: () => void;`
The `onClose` prop must be a function. `() => void` means "a function that takes no parameters and returns nothing." This gets called when the user wants to close the chat.

**Line 12:** `}`
We close the props interface.

**Line 13:** (empty line)
Blank line.

**Line 14:** `export default function ChatbotWidget({ isOpen, onClose }: ChatbotWidgetProps) {`
We're defining and exporting the ChatbotWidget component. The `{ isOpen, onClose }` part is destructuring - it extracts those values from the props object. The `: ChatbotWidgetProps` is TypeScript saying "these props must match the interface we defined."

**Line 15:** `const [messages, setMessages] = useState<Message[]>([]);`
We're creating state for the messages array. `Message[]` means "an array of Message objects." It starts empty. `setMessages` is how we update this array.

**Line 16:** `const [input, setInput] = useState('');`
This is state for the input field - what the user is typing. It starts empty. `setInput` updates when the user types.

**Line 17:** `const [isLoading, setIsLoading] = useState(false);`
This tracks whether we're waiting for a response from the AI. It starts as false. We'll use this to show a loading indicator while the AI thinks.

**Line 18:** `const messagesEndRef = useRef<HTMLDivElement>(null);`
We're creating a ref to a DOM element. Refs are like direct handles to HTML elements - they let us work with the DOM directly. We'll use this to scroll to the bottom when new messages arrive. The `<HTMLDivElement>` is TypeScript saying "this ref points to a div."

**Line 19:** `const sessionId = useRef(`session-${Date.now()}`);`
We're creating a ref for the session ID. `Date.now()` gets the current timestamp, so this creates a unique ID like "session-1716587900000". We use a ref instead of state because we don't want it to change when the component re-renders - it should stay the same for the whole chat session.

**Line 20:** (empty line)
Blank line.

**Line 21:** `const scrollToBottom = () => {`
We're defining a helper function to scroll the chat to the bottom. This is useful so users always see the newest messages.

**Line 22:** `messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });`
`messagesEndRef.current` accesses the actual DOM element. The `?` is optional chaining - if current is null, it won't crash. `scrollIntoView()` scrolls that element into view, and `{ behavior: 'smooth' }` makes it animated.

**Line 23:** `};`
We close the function.

**Line 24:** (empty line)
Blank line.

**Line 25:** `useEffect(() => {`
We're starting a useEffect hook. useEffect runs after the component renders. It's used for "side effects" - things outside React's normal process, like API calls.

**Line 26:** `scrollToBottom();`
Inside the effect, we call scrollToBottom. This scrolls to the bottom whenever the effect runs.

**Line 27:** `}, [messages]);`
This is the dependency array. It tells React when to re-run this effect. By putting `messages` in the array, we're saying "run this whenever messages changes." So every time a new message is added, the chat scrolls to the bottom.

**Line 28:** (empty line)
Blank line.

**Line 29:** `const sendMessage = async () => {`
We're defining the sendMessage function. The `async` keyword means this function will use `await` for async operations (like waiting for the AI). This handles sending the user's message to the backend.

**Line 30:** `if (!input.trim() || isLoading) return;`
This is a guard clause - it prevents the function from running if conditions aren't met. `!input.trim()` checks if the input is empty or just whitespace. `||` means "or." `isLoading` checks if we're already waiting. If either is true, the function exits early. This prevents sending empty messages or multiple requests.

**Line 31:** (empty line)
Blank line.

**Line 32:** `const userMessage = input.trim();`
We clean up the input by calling `trim()`, which removes spaces from the beginning and end. We store this in `userMessage`.

**Line 33:** `setInput('');`
We clear the input field by setting it to empty. This makes the input box appear empty after sending.

**Line 34:** `setMessages(prev => [...prev, { role: 'user', content: userMessage }]);`
We're adding the user's message to the messages array. `prev` is the previous state (the current array). `[...prev]` creates a copy using the spread operator. Then we add the new message to the end. This triggers React to re-render with the new message.

**Line 35:** `setIsLoading(true);`
We set loading to true. This shows a loading indicator so the user knows we're waiting.

**Line 36:** (empty line)
Blank line.

**Line 37:** `try {`
We're starting a try block for error handling - code that might fail goes here.

**Line 38:** `const response = await fetch('http://localhost:5000/chat', {`
Now we're making an HTTP request to our Flask backend! `fetch()` is the browser's API for HTTP requests. The URL points to our backend's chat endpoint. The `await` means "wait for this to complete."

**Line 39:** `method: 'POST',`
We're specifying this is a POST request. POST is for sending data to the server (as opposed to GET, which is for retrieving data).

**Line 40:** `headers: {`
We're starting to define the headers for our request. Headers provide metadata.

**Line 41:** `'Content-Type': 'application/json',`
This header tells the server "I'm sending you JSON data." This is important so the server knows how to parse the request body.

**Line 42:** `},`
We close the headers object.

**Line 43:** `body: JSON.stringify({`
Now we're defining the body - the actual data we're sending. `JSON.stringify()` converts a JavaScript object into a JSON string (what travels over the network).

**Line 44:** `session_id: sessionId.current,`
We're including the session ID from our ref. `.current` accesses the actual value.

**Line 45:** `message: userMessage,`
We're including the user's message text.

**Line 46:** `}),`
We close the object and the stringify call.

**Line 47:** `});`
We close the fetch call. The request is sent!

**Line 48:** (empty line)
Blank line.

**Line 49:** `if (!response.ok) {`
We're checking if the response was successful. `response.ok` is true for status codes 200-299. The `!` means "not," so this runs if the response was NOT successful.

**Line 50:** `throw new Error('Failed to get response');`
If the response wasn't successful, we throw an error. This jumps to the catch block where we handle it gracefully.

**Line 51:** `}`
We close the if statement.

**Line 52:** (empty line)
Blank line.

**Line 53:** `const data = await response.json();`
If we got here, the response was successful! Now we parse the JSON response from the server. `response.json()` reads the response body and converts it from JSON to a JavaScript object. `await` waits for this to complete.

**Line 54:** `setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);`
We're adding the AI's response to the messages array, just like we did with the user's message. The role is 'assistant' this time, and the content comes from `data.reply` (what our Flask backend sent back).

**Line 55:** `} catch (error) {`
This is the catch block - it runs if anything went wrong in the try block (network error, server error, etc.).

**Line 56:** `console.error('Error sending message:', error);`
We log the error to the browser console. This is helpful for debugging.

**Line 57:** `setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);`
We add an error message to the chat so the user knows something went wrong.

**Line 58:** `} finally {`
The finally block always runs, whether there was an error or not. It's for cleanup that needs to happen regardless.

**Line 59:** `setIsLoading(false);`
We turn off the loading indicator. This happens whether the request succeeded or failed, ensuring the UI doesn't get stuck.

**Line 60:** `}`
We close the finally block.

**Line 61:** `};`
We close the sendMessage function.

**Line 62:** (empty line)
Blank line.

**Line 63:** `const handleKeyPress = (e: React.KeyboardEvent) => {`
We're defining a keyboard event handler. This runs when the user presses keys in the input field. The `e: React.KeyboardEvent` is TypeScript typing for the event object.

**Line 64:** `if (e.key === 'Enter' && !e.shiftKey) {`
We're checking if Enter was pressed. `e.key` tells us which key. `&& !e.shiftKey` means "and Shift is NOT pressed." This is common in chat apps - Enter sends the message, but Shift+Enter adds a new line.

**Line 65:** `e.preventDefault();`
We prevent the default behavior. Normally Enter would add a new line in a textarea. We're stopping that so we can send the message instead.

**Line 66:** `sendMessage();`
We call sendMessage, which sends the user's message to the backend.

**Line 67:** `}`
We close the if statement.

**Line 68:** `};`
We close the handleKeyPress function.

**Line 69:** (empty line)
Blank line.

**Line 70:** `if (!isOpen) return null;`
This is an early return - if the chat isn't open, we return null. In React, returning null means "render nothing." This hides the chat widget when it's closed.

**Line 71:** (empty line)
Blank line.

**Line 72:** `return (`
Now we start the JSX return statement. This describes what to render when the chat is open.

**Line 73:** `<div className="chatbot-widget">`
This is the main container div for the chat widget. The `className` applies CSS styling to make it look like a chat window.

**Line 74:** `<div className="chatbot-header">`
This is the header section - it has the title and close button.

**Line 75:** `<div className="chatbot-title">`
This container holds the title and avatar icon.

**Line 76:** `<div className="chatbot-avatar">`
This is the container for the avatar/icon.

**Line 77-79:** `<svg>...</svg>`
We're rendering an inline SVG icon (a user avatar). Using inline SVGs means we don't need an external icon library.

**Line 80:** `</div>`
We close the avatar div.

**Line 81:** `<span>Stephen's AI Assistant</span>`
This is the title text in the header. It tells users whose AI assistant this is.

**Line 82:** `</div>`
We close the title div.

**Line 83:** `<button className="close-button" onClick={onClose} aria-label="Close chat">`
This is the close button. When clicked, it calls the `onClose` prop (from the parent component). The `aria-label` provides accessibility text for screen readers.

**Line 84-86:** `<svg>...</svg>`
We're rendering an X icon for the close button using inline SVG.

**Line 87:** `</button>`
We close the close button.

**Line 88:** `</div>`
We close the header div.

**Line 89:** (empty line)
Blank line.

**Line 90:** `<div className="chatbot-messages">`
This is the container for all the messages. This is where the conversation history shows up.

**Line 91:** `{messages.length === 0 && (`
This is conditional rendering. We're checking if the messages array is empty. If it is, we show a welcome message. The `&&` means "and then render this."

**Line 92-95:** `<div className="welcome-message">...</div>`
This is the welcome message that appears when the chat is empty. It greets the user and explains what the AI can help with.

**Line 96:** `)}`
We close the conditional rendering.

**Line 97:** `{messages.map((message, index) => (`
Now we're mapping over the messages array to render each message. The `.map()` function transforms each item into JSX. `message` is the current message object, and `index` is its position.

**Line 98:** `<div key={index} className={`message ${message.role}`}>`
We render a div for each message. The `key={index}` is required by React for list items - it helps React track changes. The className includes both "message" and the role, which lets us style user messages differently from assistant messages.

**Line 99:** `<div className="message-content">`
This is an inner container for the message text.

**Line 100:** `{message.content}`
We display the actual message text. The curly braces tell React to evaluate this as JavaScript, so it shows the value of `message.content`.

**Line 101:** `</div>`
We close the message-content div.

**Line 102:** `</div>`
We close the message div.

**Line 103:** `))}`
We close the map function. All messages in the array are now rendered.

**Line 104:** `{isLoading && (`
Another conditional rendering - this shows a loading indicator only when `isLoading` is true (when we're waiting for the AI).

**Line 105-113:** `<div className="message assistant">...</div>`
This is the loading indicator. It shows animated dots to indicate the AI is "typing." It's styled like an assistant message so it fits in.

**Line 114:** `)}`
We close the conditional rendering.

**Line 115:** `<div ref={messagesEndRef} />`
This is an invisible div at the bottom. We attach our ref to it. Remember that scrollToBottom function? It scrolls to this element, ensuring new messages are always visible.

**Line 116:** `</div>`
We close the messages container.

**Line 117:** (empty line)
Blank line.

**Line 118:** `<div className="chatbot-input">`
This is the container for the input field and send button at the bottom.

**Line 119:** `<textarea`
We're using a textarea instead of a regular input. Textareas can handle multiple lines, which is better for chat.

**Line 120:** `value={input}`
This makes the textarea a "controlled component" - the value comes from our state. React is the "source of truth" for what's in the input.

**Line 121:** `onChange={(e) => setInput(e.target.value)}`
This runs whenever the user types. `e.target.value` is what they typed, and we update our input state. This happens on every keystroke.

**Line 122:** `onKeyPress={handleKeyPress}`
We attach our keyboard event handler here. This detects when the user presses Enter to send.

**Line 123:** `placeholder="Type your message..."`
This is the placeholder text that shows when the input is empty.

**Line 124:** `rows={1}`
We start with 1 row. The textarea could expand, but we keep it at 1 for this design.

**Line 125:** `disabled={isLoading}`
We disable the input while loading. This prevents sending multiple messages at once.

**Line 126:** `/>`
We close the textarea (self-closing).

**Line 127:** `<button`
Now we're starting the send button.

**Line 128:** `className="send-button"`
This applies the CSS class for styling.

**Line 129:** `onClick={sendMessage}`
When clicked, this calls sendMessage, which sends the user's message to the backend.

**Line 130:** `disabled={!input.trim() || isLoading}`
We disable the button if the input is empty or if we're already loading. This prevents sending empty messages or multiple requests.

**Line 131:** `aria-label="Send message"`
Accessibility label for screen readers.

**Line 132-135:** `<svg>...</svg>`
We're rendering a send icon (an arrow) using inline SVG.

**Line 136:** `</button>`
We close the send button.

**Line 137:** `</div>`
We close the input container.

**Line 138:** `</div>`
We close the main chatbot-widget div.

**Line 139:** `);`
We close the return statement.

**Line 140:** `}`
We close the ChatbotWidget function. Done!

### LandingPage.tsx - Key Sections

The LandingPage component is pretty big (297 lines), so instead of going through every single line, let me walk you through the key sections and how they work together.

**Lines 1-2:** Import statements
We're importing the React hooks we'll need (`useEffect`, `useRef`, `useState`) and the CSS file. These hooks let us add interactivity to the page.

**Lines 4-6:** Props interface
We define that LandingPage accepts one prop: `onOpenChat`, which is a function. This gets called when users click buttons to open the chat widget.

**Lines 8-55:** SVG Icon Components
We define several reusable icon components (ShieldIcon, MonitorIcon, WrenchIcon, etc.). Each is a simple function that returns an SVG. Instead of importing an icon library, we create our own. They're used throughout the page to add visual interest.

**Line 57:** Component definition
`export default function LandingPage({ onOpenChat }: LandingPageProps)` - This defines the main LandingPage component. We're destructuring the `onOpenChat` prop and adding TypeScript typing.

**Line 58:** `const navRef = useRef<HTMLElement>(null);`
We create a ref to the navigation element. This lets us access the navbar directly if we need to (mostly for potential future use).

**Line 59:** `const [scrolled, setScrolled] = useState(false);`
This state tracks whether the user has scrolled down. We'll use this to add a shadow to the navbar when scrolled - a common design pattern.

**Lines 61-67:** Scroll effect
We use `useEffect` to add a scroll event listener to the window. When the user scrolls, we check if they've scrolled more than 20 pixels. If so, we set `scrolled` to true. The return function removes the event listener when the component unmounts (cleanup - important to prevent memory leaks). The `{ passive: true }` option improves scroll performance.

**Lines 69-74:** Scroll helper function
The `scrollTo` function smoothly scrolls to a section by its ID. It uses `scrollIntoView` with `{ behavior: 'smooth' }` for smooth scrolling. This gets called when users click navigation links.

**Lines 76-90:** Navigation bar
This is the navbar at the top. It has the logo and navigation links. The className includes `scrolled` conditionally - if the user has scrolled down, it adds the 'scrolled' class which adds a shadow. Each link has an onClick handler that prevents the default link behavior and calls our smooth scrollTo function instead.

**Lines 92-127:** Hero section
This is the main banner at the top - the first thing users see. It has a badge, headline, subtitle, call-to-action buttons, and statistics. The "Free Consultation" button calls `onOpenChat()` to open the chat widget. Classic landing page pattern - grab attention and give users a clear action.

**Lines 129-159:** About section
This provides company information and certifications. It uses the CheckCircleIcon component to list features like "Licensed & Insured" and "NICET Certified." Builds trust with potential customers.

**Lines 161-204:** Services section
This displays a grid of service cards. Each card has an icon, title, and description. We use the icon components we defined earlier. The grid layout makes it easy to scan all the services.

**Lines 206-243:** Products section
Similar to services, but for products. It displays product cards with larger icons (SmokeIcon, PanelIcon, WifiIcon) and product-specific content. Each product has a tag like "Smart Technology" or "Wireless" to highlight features.

**Lines 245-254:** CTA section
This is a call-to-action section encouraging users to get a quote. The button calls `onOpenChat()` to open the chat. It's placed after showing all the services and products, when users are most likely to take action.

**Lines 256-279:** Contact section
This provides contact information with phone and email. We use PhoneIcon and MailIcon for visual cues. The phone number and email are clickable links, making it easy for users to get in touch.

**Lines 281-293:** Footer
The footer has the branding, navigation links, and copyright notice. It provides a consistent footer and gives users another way to navigate.

---

## Step 7: Understanding TypeScript

TypeScript is JavaScript with types. It helps catch errors before you run your code.

**Example:**
```typescript
// Without TypeScript (JavaScript)
function greet(name) {
  return "Hello " + name;
}

// With TypeScript
function greet(name: string): string {
  return "Hello " + name;
}
```

**Why this is helpful:**
- If you try to pass a number to `greet()`, TypeScript will warn you
- If you forget to return a string, TypeScript will warn you
- Your IDE can give you autocomplete suggestions

**In our project:**
- Props have type definitions (e.g., `interface LandingPageProps`)
- Function parameters have types
- Return types are specified

---

## Step 8: Building for Production

When you're ready to deploy:

**Build the app:**
```bash
npm run build
```

This creates a `dist/` folder with optimized, minified files ready for deployment.

**Preview the production build:**
```bash
npm run preview
```

---

## Step 9: Running Both Backend and Frontend

To see the full application working:

**Terminal 1 - Backend:**
```bash
cd /home/stevie732/fs-ollamaBot
source .venv/bin/activate
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd /home/stevie732/fs-ollamaBot/client
npm run dev
```

Now open `http://localhost:5173/` and try the chat widget!

---

## Understanding the Styling

### CSS Modules vs Global CSS

**Global CSS (`index.css`):**
- Applies to the entire app
- Contains basic CSS reset and global styles
- Styles for the floating chat button that appears on every page

**Component CSS (`LandingPage.css`):**
- Scoped to specific components
- Only affects that component's elements
- Prevents style conflicts between components

### Modern CSS Features Used

- **Flexbox & Grid**: For modern layouts
- **CSS Transitions**: For smooth hover animations
- **Media Queries**: For responsive design
- **Solid Colors**: Clean, flat design with no gradients

---

## Key React Concepts Explained

### Components
Components are reusable pieces of UI. Think of them like functions that return HTML.

```typescript
function Welcome() {
  return <h1>Hello, welcome!</h1>;
}
```

### Props
Props are how you pass data to components.

```typescript
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

// Usage
<Greeting name="FireSafe Solutions" />
```

### State
State is data that can change over time.

```typescript
const [count, setCount] = useState(0);

// Update state
setCount(count + 1);
```

### Hooks
Hooks are special functions that let you use React features.

- `useState`: For managing state
- `useEffect`: For side effects (like API calls, subscriptions)
- `useRef`: For referencing DOM elements
- `useCallback`: For memoizing functions

---

## Common Patterns in This Project

### Conditional Rendering
Showing/hiding things based on state:

```typescript
{isChatOpen && <ChatbotWidget />}
{!isChatOpen && <button>Open Chat</button>}
```

### Event Handlers
Handling user interactions:

```typescript
<button onClick={() => setIsChatOpen(true)}>
  Open Chat
</button>
```

### Async/Await for API Calls
Making HTTP requests:

```typescript
const response = await fetch('http://localhost:5000/chat');
const data = await response.json();
```

---

## Troubleshooting

**Problem: "Module not found" error**
- Solution: Run `npm install` in the client folder

**Problem: Port 5173 already in use**
- Solution: Vite will automatically try the next available port (5174, 5175, etc.)

**Problem: TypeScript errors**
- Solution: These are helpful! Read the error message - it's telling you what's wrong with your types

**Problem: Chat widget not connecting to backend**
- Solution: Make sure the Flask server is running on port 5000
- Check that the URL in the fetch call matches your backend URL

**Problem: Styles not loading**
- Solution: Make sure you're importing the CSS file in your component

---

## Customizing the Landing Page

### Changing Colors
Edit `client/src/index.css` - look for the CSS variables in `:root`:

```css
:root {
  --accent: #dc2626;  /* Change this to your brand color */
}
```

### Changing Content
Edit `client/src/components/LandingPage.tsx` - update the text, services, and products.

### Adding New Sections
1. Create a new section in `LandingPage.tsx`
2. Add styling in `LandingPage.css`
3. Add a navigation link to it

---

## File Structure (Updated)

Your complete project should look like this:

```
fs-ollamaBot/
├── .venv/              # Python virtual environment
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── Modelfile           # AI model configuration
├── app.py              # Flask API
├── requirements.txt    # Python dependencies
└── README.md           # This file
```

---

## Deploying to Production

When you're ready to put this on the internet:

### 1. Use a Production Server
Flask's built-in server is for development only. For production, use Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

- `-w 4`: Use 4 worker processes
- `-b 0.0.0.0:5000`: Bind to all network interfaces on port 5000
- `app:app`: The module name and app object

### 2. Disable Debug Mode
Change the last line of `app.py`:
```python
app.run(debug=False, port=5000)
```

### 3. Restrict CORS (Optional)
If you want only your specific website to use this API:
```python
CORS(app, origins=["https://your-website.com"])
```

### 4. Use Environment Variables
For sensitive info like API keys, use environment variables instead of hardcoding them.

---

## Troubleshooting

**Problem: "Module not found" error**
- Solution: Make sure your virtual environment is activated (`source .venv/bin/activate`)

**Problem: Ollama connection error**
- Solution: Make sure Ollama is running (`ollama serve` in a separate terminal)

**Problem: CORS error in browser**
- Solution: The flask-cors package should handle this. Check that it's installed.

**Problem: Port 5000 already in use**
- Solution: Change the port in `app.py` to 5001 or another available port

---

## File Structure

Your final project should look like this:
```
fs-ollamaBot/
├── .venv/              # Python virtual environment (don't edit this)
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── Modelfile           # AI model configuration (FireSafe Solutions)
├── app.py              # Flask API code
├── requirements.txt    # Python dependencies
└── README.md           # This file
```

---

## Summary

You just built:
1. A Python web API using Flask
2. A custom AI model using Ollama for FireSafe Solutions
3. A chatbot that maintains conversation history
4. A React frontend with a modern, professional business design
5. A full-stack application with backend and frontend working together

**Backend concepts you learned:**
- Virtual environments for dependency management
- Flask for building web APIs
- Ollama for running AI models locally
- CORS for cross-origin requests
- JSON for data exchange

**Frontend concepts you learned:**
- React for building user interfaces
- TypeScript for type-safe code
- Vite for fast development and building
- Components and props for reusable UI
- State management with hooks
- CSS for modern styling

**Next steps:**
- Try modifying the Modelfile to add more fire safety information
- Customize the landing page content and styling for your business
- Add more features to the chat widget
- Deploy both backend and frontend to a cloud server (DigitalOcean, AWS, Vercel, etc.)

Happy coding!

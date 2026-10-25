---
layout: single
title: "How Claude Code Runs Your Tasks: Where the Model Thinks and Where the Code Runs"
date: 2026-10-25
show_date: true
toc: true
toc_label: "How Claude Code Works"
toc_sticky: true
classes: wide
categories:
  - AI
  - Developer Tools
tags:
  - Claude Code
  - Claude Opus 5.5
  - Claude Fable 5.1
  - AI Agents
  - Beginner
---

<style>
.cc-fig { margin: 1.75em 0; overflow-x: auto; }
.cc-fig svg { display: block; width: 100%; min-width: 560px; height: auto; }
.cc-fig figcaption { font-size: 0.85em; margin-top: 0.5em; text-align: center; }
.cc-fig text { font-family: inherit; font-size: 14px; fill: var(--ink); }
.cc-fig .sm { font-size: 12px; fill: var(--pencil); }
.cc-fig .hd { font-size: 15px; font-weight: 700; }
.cc-fig .box { fill: var(--paper-raised); stroke: var(--rule); stroke-width: 1.5; }
.cc-fig .box-ai { fill: var(--violet-soft); stroke: var(--violet); stroke-width: 1.5; }
.cc-fig .zone-mac { fill: none; stroke: var(--notice-success); stroke-width: 2; stroke-dasharray: 6 5; }
.cc-fig .zone-ai { fill: none; stroke: var(--violet); stroke-width: 2; stroke-dasharray: 6 5; }
.cc-fig .mac { fill: var(--notice-success); }
.cc-fig .ai { fill: var(--violet); }
.cc-fig .line { stroke: var(--pencil); stroke-width: 1.6; fill: none; }
.cc-fig .life { stroke: var(--rule); stroke-width: 1.5; stroke-dasharray: 4 4; }
.cc-fig .loop { fill: none; stroke: var(--notice-warning); stroke-width: 1.5; stroke-dasharray: 5 4; }
.cc-fig .warn { fill: var(--notice-warning); }
.cc-fig .head { fill: var(--pencil); }
.cc-fig .seg-ai { fill: var(--violet); }
.cc-fig .seg-net { fill: var(--pencil); }
.cc-fig .seg-mac { fill: var(--notice-success); }
</style>

When I started using Claude Code with **Claude Opus 5.5** and **Claude Fable 5.1**, I had a simple question: *when the agent builds or runs my code, where does that happen? On my laptop, or on Anthropic's servers?*

The short answer is **both, but for different jobs**. The model *thinks* on Anthropic's servers. The tools *run* on your machine. This post explains how that works, step by step, with diagrams. I keep the language simple, and I explain each new word the first time it appears.

**What you will learn:**

- The two places where work happens: your machine and Anthropic's cloud
- The **agent loop**: how one task becomes many small steps
- Exactly what data leaves your machine, and what stays
- Why choosing Opus or Fable doesn't change *where* anything runs
- How a **cloud session** is different from a **local session**
- When your hardware matters for speed, and when it doesn't

---

## 1. The Big Picture: Two Places, Two Jobs

Claude Code is made of two parts that talk to each other over the internet:

| Part | Where it lives | What it does |
|---|---|---|
| **The model** (Opus 5.5 or Fable 5.1) | Anthropic's servers | Reads the conversation, thinks, writes text, and decides which tool to use next |
| **The Claude Code app** (CLI, desktop app, or IDE extension) | Your machine | Shows you the chat, runs the tools the model asks for, and sends results back |

A **tool** is an action the app knows how to do: run a shell command, read a file, edit a file, search the code, open a web page, and so on.

**In simple words:** the model is the *brain*, and it lives in Anthropic's cloud. Your machine is the *hands*. The brain says "run `dotnet test`", and your machine runs it.

<figure class="cc-fig">
<svg viewBox="0 0 760 380" role="img" aria-label="Your machine runs the Claude Code app, the tools and holds your files. Anthropic's cloud runs the API and the model. The app sends the conversation and tool results; the model sends back replies and tool calls.">
<defs><marker id="ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="head"/></marker></defs>
<rect x="15" y="15" width="320" height="350" rx="14" class="zone-mac"/>
<text x="35" y="45" class="hd mac">YOUR MACHINE</text>
<rect x="425" y="15" width="320" height="350" rx="14" class="zone-ai"/>
<text x="445" y="45" class="hd ai">ANTHROPIC'S CLOUD</text>
<rect x="40" y="65" width="270" height="70" rx="10" class="box"/>
<text x="175" y="95" text-anchor="middle" class="hd">Claude Code app</text>
<text x="175" y="117" text-anchor="middle" class="sm">chat window, permissions, agent loop</text>
<rect x="40" y="165" width="270" height="70" rx="10" class="box"/>
<text x="175" y="195" text-anchor="middle" class="hd">Tools</text>
<text x="175" y="217" text-anchor="middle" class="sm">shell, read/edit files, search, browser</text>
<rect x="40" y="265" width="270" height="80" rx="10" class="box"/>
<text x="175" y="295" text-anchor="middle" class="hd">Your project &amp; toolchain</text>
<text x="175" y="317" text-anchor="middle" class="sm">source files, git, .NET, Node, Docker,</text>
<text x="175" y="333" text-anchor="middle" class="sm">CPU, RAM, disk</text>
<rect x="450" y="65" width="270" height="70" rx="10" class="box"/>
<text x="585" y="95" text-anchor="middle" class="hd">Anthropic API</text>
<text x="585" y="117" text-anchor="middle" class="sm">receives each request over HTTPS</text>
<rect x="450" y="165" width="270" height="110" rx="10" class="box-ai"/>
<text x="585" y="200" text-anchor="middle" class="hd">The model</text>
<text x="585" y="224" text-anchor="middle">Opus 5.5 or Fable 5.1</text>
<text x="585" y="250" text-anchor="middle" class="sm">thinks, writes, picks the next tool</text>
<text x="585" y="320" text-anchor="middle" class="sm">No access to your disk.</text>
<text x="585" y="338" text-anchor="middle" class="sm">It only sees what the app sends.</text>
<line x1="312" y1="88" x2="448" y2="88" class="line" marker-end="url(#ah1)"/>
<text x="380" y="66" text-anchor="middle" class="sm">conversation +</text>
<text x="380" y="80" text-anchor="middle" class="sm">tool results</text>
<line x1="448" y1="115" x2="312" y2="115" class="line" marker-end="url(#ah1)"/>
<text x="380" y="135" text-anchor="middle" class="sm">reply +</text>
<text x="380" y="151" text-anchor="middle" class="sm">tool calls</text>
<line x1="175" y1="137" x2="175" y2="163" class="line" marker-start="url(#ah1)" marker-end="url(#ah1)"/>
<line x1="175" y1="237" x2="175" y2="263" class="line" marker-start="url(#ah1)" marker-end="url(#ah1)"/>
<line x1="585" y1="137" x2="585" y2="163" class="line" marker-start="url(#ah1)" marker-end="url(#ah1)"/>
</svg>
<figcaption>Figure 1. The model thinks in Anthropic's cloud. The tools run on your machine.</figcaption>
</figure>

One important detail: **the model can't touch your disk.** It never connects to your machine. It only sees the text the app sends to it. If the app never reads a file, the model never sees that file.

---

## 2. The Agent Loop, Step by Step

An **agent** is a model that can use tools in a loop: it looks at the task, uses a tool, looks at the result, and decides what to do next. It keeps going until the task is done.

Let's follow one real request: **"Fix the failing test."**

<figure class="cc-fig">
<svg viewBox="0 0 760 640" role="img" aria-label="Sequence diagram: you send a request to the app, the app sends it to the model, the model asks for a tool, the app runs the tool on your machine and sends the result back, and this repeats until the model writes a final answer.">
<defs><marker id="ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="head"/></marker></defs>
<rect x="30" y="15" width="120" height="50" rx="10" class="box"/>
<text x="90" y="45" text-anchor="middle" class="hd">You</text>
<rect x="210" y="15" width="150" height="50" rx="10" class="box"/>
<text x="285" y="38" text-anchor="middle" class="hd">Claude Code app</text>
<text x="285" y="56" text-anchor="middle" class="sm mac">your machine</text>
<rect x="400" y="15" width="140" height="50" rx="10" class="box"/>
<text x="470" y="38" text-anchor="middle" class="hd">Tools</text>
<text x="470" y="56" text-anchor="middle" class="sm mac">your machine</text>
<rect x="590" y="15" width="150" height="50" rx="10" class="box-ai"/>
<text x="665" y="38" text-anchor="middle" class="hd">Model</text>
<text x="665" y="56" text-anchor="middle" class="sm ai">Anthropic's cloud</text>
<line x1="90" y1="65" x2="90" y2="625" class="life"/>
<line x1="285" y1="65" x2="285" y2="625" class="life"/>
<line x1="470" y1="65" x2="470" y2="625" class="life"/>
<line x1="665" y1="65" x2="665" y2="625" class="life"/>
<line x1="90" y1="105" x2="283" y2="105" class="line" marker-end="url(#ah2)"/>
<text x="187" y="97" text-anchor="middle">① "Fix the failing test"</text>
<line x1="285" y1="145" x2="663" y2="145" class="line" marker-end="url(#ah2)"/>
<text x="475" y="137" text-anchor="middle">② request + instructions + tool list</text>
<rect x="245" y="170" width="505" height="345" rx="10" class="loop"/>
<text x="258" y="190" class="sm warn">LOOP: repeat while the model asks for tools</text>
<line x1="665" y1="225" x2="287" y2="225" class="line" marker-end="url(#ah2)"/>
<text x="475" y="217" text-anchor="middle">③ tool call: run "dotnet test"</text>
<line x1="285" y1="265" x2="468" y2="265" class="line" marker-end="url(#ah2)"/>
<text x="377" y="257" text-anchor="middle">④ check permission, run</text>
<rect x="400" y="275" width="140" height="26" rx="6" class="box"/>
<text x="470" y="293" text-anchor="middle" class="sm">runs on your CPU</text>
<line x1="470" y1="320" x2="287" y2="320" class="line" marker-end="url(#ah2)"/>
<text x="377" y="312" text-anchor="middle">⑤ output: "1 test failed"</text>
<line x1="285" y1="360" x2="663" y2="360" class="line" marker-end="url(#ah2)"/>
<text x="475" y="352" text-anchor="middle">⑥ tool result (the output text)</text>
<line x1="665" y1="405" x2="287" y2="405" class="line" marker-end="url(#ah2)"/>
<text x="475" y="397" text-anchor="middle">⑦ tool call: edit PriceCalculator.cs</text>
<line x1="285" y1="445" x2="468" y2="445" class="line" marker-end="url(#ah2)"/>
<text x="377" y="437" text-anchor="middle">⑧ write file to disk</text>
<line x1="470" y1="485" x2="287" y2="485" class="line" marker-end="url(#ah2)"/>
<text x="377" y="477" text-anchor="middle">⑨ "edit applied"</text>
<text x="600" y="490" text-anchor="middle" class="sm">… run tests again, and so on</text>
<line x1="665" y1="560" x2="287" y2="560" class="line" marker-end="url(#ah2)"/>
<text x="475" y="552" text-anchor="middle">⑩ final answer (no more tool calls)</text>
<line x1="285" y1="600" x2="92" y2="600" class="line" marker-end="url(#ah2)"/>
<text x="187" y="592" text-anchor="middle">⑪ shows you the result</text>
</svg>
<figcaption>Figure 2. One task becomes a loop of small round trips between the app and the model.</figcaption>
</figure>

Here is what happens at each step:

1. **You type a request** in the Claude Code app.
2. **The app sends a request to the Anthropic API.** It includes your message, the app's instructions to the model (the *system prompt*), and a list of tools the model may use.
3. **The model replies with a tool call.** A **tool call** is a small, structured message like *"use the Bash tool with the command `dotnet test`"*. The model does not run anything. It only *asks*.
4. **The app checks permissions and runs the tool on your machine.** Depending on your permission mode, it may ask you first ("Allow this command?").
5. **The tool produces output**, for example a test failure message.
6. **The app sends that output back to the model** as a **tool result**.
7. **The model reads the result and asks for the next tool**, for example "edit this file".
8. **The app edits the file on your disk.**
9. **The app reports back** that the edit worked.
10. **The loop repeats** (run the tests again, read another file, ...) until the model decides the task is done and writes a final answer **without** a tool call.
11. **The app shows you the answer.**

**Key idea:** every arrow to the right of the app is a network round trip to Anthropic. Every arrow between the app and the tools stays on your machine.

---

## 3. What Data Leaves Your Machine?

This is the part I wanted to understand most. The rule is simple:

> **Only what goes into the conversation is sent to Anthropic.** Everything else stays on your machine.

<figure class="cc-fig">
<svg viewBox="0 0 760 330" role="img" aria-label="Left: things that stay on your machine, such as files the agent never read, the actual running of commands, your CPU work. Right: things sent to Anthropic each turn, such as your messages, file contents the agent read, command output, and the system prompt and tool list.">
<defs><marker id="ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="head"/></marker></defs>
<rect x="15" y="15" width="300" height="300" rx="14" class="zone-mac"/>
<text x="35" y="47" class="hd mac">STAYS ON YOUR MACHINE</text>
<text x="35" y="85">• Files the agent never opened</text>
<text x="35" y="115">• The running of commands</text>
<text x="50" y="135" class="sm">(builds, tests, servers, Docker)</text>
<text x="35" y="165">• Your installed SDKs and tools</text>
<text x="35" y="195">• CPU, memory and disk work</text>
<text x="35" y="225">• Files the agent creates or edits</text>
<text x="50" y="245" class="sm">(the result lands on your disk)</text>
<text x="35" y="285" class="sm">The model can't reach any of this</text>
<text x="35" y="303" class="sm">unless the app sends it.</text>
<rect x="335" y="135" width="90" height="60" rx="10" class="box"/>
<text x="380" y="162" text-anchor="middle" class="sm">HTTPS</text>
<text x="380" y="180" text-anchor="middle" class="sm">each turn</text>
<line x1="315" y1="165" x2="333" y2="165" class="line"/>
<line x1="427" y1="165" x2="443" y2="165" class="line" marker-end="url(#ah3)"/>
<rect x="445" y="15" width="300" height="300" rx="14" class="zone-ai"/>
<text x="465" y="47" class="hd ai">SENT TO ANTHROPIC</text>
<text x="465" y="85">• Your messages</text>
<text x="465" y="115">• The system prompt and tool list</text>
<text x="465" y="145">• Contents of files the agent read</text>
<text x="465" y="175">• Command output (stdout/stderr)</text>
<text x="465" y="205">• Search results, web page text</text>
<text x="465" y="235">• The model's own earlier replies</text>
<text x="465" y="285" class="sm">In short: the whole conversation</text>
<text x="465" y="303" class="sm">so far, every time.</text>
</svg>
<figcaption>Figure 3. The conversation crosses the network. Your machine's work does not.</figcaption>
</figure>

Some practical points:

- **If the agent reads a file, its contents are sent.** This includes `.env` files or secrets if the agent opens them. Be careful what you ask it to read, and use permission rules to block sensitive paths.
- **Command output is sent, not the command's work.** A 5-minute build runs on your CPU. Only the text it prints (for example, "Build succeeded" or an error list) goes to the model.
- **The model's edits are written by your machine.** The model sends the new text of the file, and the app writes it to your disk.

### The whole conversation is sent every turn

The Anthropic API doesn't remember anything between requests. So on every round trip, the app sends **the whole conversation so far**, not just the newest message. That is how the model "remembers" what it did three steps ago.

<figure class="cc-fig">
<svg viewBox="0 0 760 250" role="img" aria-label="Each request contains all earlier messages plus the newest one, so requests grow over time. Prompt caching lets the server reuse the unchanged beginning. When the conversation gets very long, older parts are summarized.">
<text x="20" y="45" class="hd">Request 1</text>
<rect x="130" y="25" width="120" height="30" rx="5" class="box-ai"/>
<text x="190" y="45" text-anchor="middle" class="sm">prompt</text>
<text x="20" y="95" class="hd">Request 2</text>
<rect x="130" y="75" width="120" height="30" rx="5" class="box"/>
<text x="190" y="95" text-anchor="middle" class="sm">prompt</text>
<rect x="250" y="75" width="150" height="30" rx="5" class="box-ai"/>
<text x="325" y="95" text-anchor="middle" class="sm">tool call + result</text>
<text x="20" y="145" class="hd">Request 3</text>
<rect x="130" y="125" width="120" height="30" rx="5" class="box"/>
<text x="190" y="145" text-anchor="middle" class="sm">prompt</text>
<rect x="250" y="125" width="150" height="30" rx="5" class="box"/>
<text x="325" y="145" text-anchor="middle" class="sm">tool call + result</text>
<rect x="400" y="125" width="150" height="30" rx="5" class="box-ai"/>
<text x="475" y="145" text-anchor="middle" class="sm">tool call + result</text>
<text x="20" y="195" class="hd">Request 4</text>
<rect x="130" y="175" width="120" height="30" rx="5" class="box"/>
<text x="190" y="195" text-anchor="middle" class="sm">prompt</text>
<rect x="250" y="175" width="150" height="30" rx="5" class="box"/>
<text x="325" y="195" text-anchor="middle" class="sm">tool call + result</text>
<rect x="400" y="175" width="150" height="30" rx="5" class="box"/>
<text x="475" y="195" text-anchor="middle" class="sm">tool call + result</text>
<rect x="550" y="175" width="150" height="30" rx="5" class="box-ai"/>
<text x="625" y="195" text-anchor="middle" class="sm">tool call + result</text>
<rect x="130" y="222" width="18" height="14" rx="3" class="box"/>
<text x="156" y="234" class="sm">already sent before (often reused from cache)</text>
<rect x="470" y="222" width="18" height="14" rx="3" class="box-ai"/>
<text x="496" y="234" class="sm">new in this request</text>
</svg>
<figcaption>Figure 4. Each request carries the full history. The new part is shown in violet.</figcaption>
</figure>

Two features keep this fast and affordable:

- **Prompt caching:** the server can reuse the unchanged beginning of the conversation instead of processing it again from scratch.
- **Compaction:** when the conversation gets too long for the model's **context window** (the maximum amount of text it can read at once), Claude Code summarizes the older parts so work can continue.

This is also why very long sessions can feel slower: there is simply more text to send and read on every turn.

---

## 4. Does Choosing Opus 5.5 or Fable 5.1 Change Anything?

**It changes *which brain* answers. It doesn't change *where* anything runs.**

<figure class="cc-fig">
<svg viewBox="0 0 760 240" role="img" aria-label="The same Claude Code app and the same tools on your machine send requests to Anthropic. A model ID in the request picks either Opus 5.5 or Fable 5.1. Both run in Anthropic's cloud.">
<defs><marker id="ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="head"/></marker></defs>
<rect x="15" y="15" width="280" height="210" rx="14" class="zone-mac"/>
<text x="35" y="45" class="hd mac">YOUR MACHINE (same either way)</text>
<rect x="40" y="65" width="230" height="60" rx="10" class="box"/>
<text x="155" y="100" text-anchor="middle" class="hd">Claude Code app</text>
<rect x="40" y="145" width="230" height="60" rx="10" class="box"/>
<text x="155" y="180" text-anchor="middle" class="hd">Same tools, same files</text>
<rect x="415" y="15" width="330" height="210" rx="14" class="zone-ai"/>
<text x="435" y="45" class="hd ai">ANTHROPIC'S CLOUD</text>
<rect x="440" y="65" width="280" height="60" rx="10" class="box-ai"/>
<text x="580" y="92" text-anchor="middle" class="hd">Claude Opus 5.5</text>
<text x="580" y="112" text-anchor="middle" class="sm">model: claude-opus-5-5</text>
<rect x="440" y="145" width="280" height="60" rx="10" class="box-ai"/>
<text x="580" y="172" text-anchor="middle" class="hd">Claude Fable 5.1</text>
<text x="580" y="192" text-anchor="middle" class="sm">model: claude-fable-5-1</text>
<line x1="272" y1="95" x2="355" y2="125" class="line"/>
<line x1="355" y1="125" x2="438" y2="95" class="line" marker-end="url(#ah4)"/>
<line x1="355" y1="125" x2="438" y2="175" class="line" marker-end="url(#ah4)"/>
<text x="355" y="205" text-anchor="middle" class="sm">model ID in</text>
<text x="355" y="221" text-anchor="middle" class="sm">each request</text>
</svg>
<figcaption>Figure 5. Switching models swaps the brain. The hands stay the same.</figcaption>
</figure>

When you pick a model in the app, Claude Code puts that model's ID in every API request. The agent loop, the tools, the permission checks, and the files on your disk are **exactly the same**. Different models can differ in quality, speed, and price, but the workflow and the data flow in this post apply to every model.

---

## 5. Local Session vs Cloud Session

So far we talked about a **local session**: you run Claude Code on your own machine. There is a second option, a **cloud session** (for example, Claude Code on the web, or moving a desktop session to the cloud). In a cloud session, the tools run somewhere else.

<figure class="cc-fig">
<svg viewBox="0 0 760 330" role="img" aria-label="Local session: the app and tools run on your machine and the model runs at Anthropic. Cloud session: the app, the tools and a copy of your repository run in a sandbox container in Anthropic's cloud, next to the model; changes come back as a git branch or pull request.">
<defs><marker id="ah5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="head"/></marker></defs>
<text x="190" y="28" text-anchor="middle" class="hd">Local session</text>
<rect x="20" y="45" width="160" height="200" rx="12" class="zone-mac"/>
<text x="100" y="70" text-anchor="middle" class="sm mac">YOUR MACHINE</text>
<rect x="35" y="85" width="130" height="44" rx="8" class="box"/>
<text x="100" y="112" text-anchor="middle">App + tools</text>
<rect x="35" y="145" width="130" height="44" rx="8" class="box"/>
<text x="100" y="172" text-anchor="middle">Your repo</text>
<rect x="225" y="45" width="140" height="200" rx="12" class="zone-ai"/>
<text x="295" y="70" text-anchor="middle" class="sm ai">ANTHROPIC</text>
<rect x="240" y="115" width="110" height="44" rx="8" class="box-ai"/>
<text x="295" y="142" text-anchor="middle">Model</text>
<line x1="167" y1="120" x2="238" y2="135" class="line" marker-start="url(#ah5)" marker-end="url(#ah5)"/>
<text x="190" y="275" text-anchor="middle" class="sm">Commands use your CPU and your files.</text>
<text x="190" y="295" text-anchor="middle" class="sm">Results land on your disk right away.</text>
<line x1="380" y1="20" x2="380" y2="310" class="life"/>
<text x="570" y="28" text-anchor="middle" class="hd">Cloud session</text>
<rect x="400" y="45" width="140" height="200" rx="12" class="zone-mac"/>
<text x="470" y="70" text-anchor="middle" class="sm mac">YOUR MACHINE</text>
<rect x="415" y="115" width="110" height="44" rx="8" class="box"/>
<text x="470" y="134" text-anchor="middle" class="sm">just a browser</text>
<text x="470" y="150" text-anchor="middle" class="sm">or the app UI</text>
<rect x="560" y="45" width="185" height="200" rx="12" class="zone-ai"/>
<text x="652" y="70" text-anchor="middle" class="sm ai">ANTHROPIC'S CLOUD</text>
<rect x="575" y="85" width="155" height="70" rx="8" class="box"/>
<text x="652" y="108" text-anchor="middle">Sandbox container</text>
<text x="652" y="126" text-anchor="middle" class="sm">app + tools +</text>
<text x="652" y="142" text-anchor="middle" class="sm">copy of your repo</text>
<rect x="575" y="180" width="155" height="44" rx="8" class="box-ai"/>
<text x="652" y="207" text-anchor="middle">Model</text>
<line x1="652" y1="157" x2="652" y2="178" class="line" marker-start="url(#ah5)" marker-end="url(#ah5)"/>
<line x1="527" y1="137" x2="573" y2="120" class="line" marker-start="url(#ah5)" marker-end="url(#ah5)"/>
<text x="570" y="275" text-anchor="middle" class="sm">Commands run in the container, not on your machine.</text>
<text x="570" y="295" text-anchor="middle" class="sm">Changes come back as a git branch or a pull request.</text>
</svg>
<figcaption>Figure 6. In a cloud session, the "hands" move into a sandbox next to the model.</figcaption>
</figure>

| | Local session | Cloud session |
|---|---|---|
| Where the model runs | Anthropic's cloud | Anthropic's cloud |
| Where commands run | **Your machine** | **A sandbox container** at Anthropic |
| Which files it sees | Your real working folder | A copy of your GitHub repo |
| Which tools are installed | Whatever **you** installed | Whatever the cloud environment has |
| How you get the changes | They are already on your disk | A pushed branch or pull request |
| Can keep working when your laptop is closed | No | Yes |

**Rule of thumb:** use a local session when the task needs your machine (local databases, your SDKs, the iOS Simulator, private files). Use a cloud session for self-contained work that should keep going without your laptop.

---

## 6. Subagents Follow the Same Rule

Claude Code can start **subagents**: helper agents that take a smaller piece of the task (like "search the repo for every place we call this API") and report back. Each subagent has its own conversation with the model, but its tools still run **in the same place as the main session**.

<figure class="cc-fig">
<svg viewBox="0 0 760 330" role="img" aria-label="On your machine, a main agent starts two subagents. Each agent has its own conversation with a model in Anthropic's cloud. All of their tools run on your machine.">
<defs><marker id="ah6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="head"/></marker></defs>
<rect x="15" y="15" width="380" height="300" rx="14" class="zone-mac"/>
<text x="35" y="45" class="hd mac">YOUR MACHINE (local session)</text>
<rect x="40" y="65" width="170" height="50" rx="10" class="box"/>
<text x="125" y="95" text-anchor="middle" class="hd">Main agent</text>
<rect x="80" y="140" width="130" height="40" rx="10" class="box"/>
<text x="145" y="165" text-anchor="middle">Subagent A</text>
<rect x="80" y="195" width="130" height="40" rx="10" class="box"/>
<text x="145" y="220" text-anchor="middle">Subagent B</text>
<path d="M58,117 L58,215 L78,215" class="line" marker-end="url(#ah6)"/>
<path d="M58,160 L78,160" class="line" marker-end="url(#ah6)"/>
<text x="64" y="132" class="sm">starts</text>
<rect x="40" y="260" width="330" height="40" rx="10" class="box"/>
<text x="205" y="285" text-anchor="middle"><tspan class="hd">Tools</tspan><tspan class="sm" dx="8">every agent's commands run here</tspan></text>
<line x1="230" y1="100" x2="230" y2="258" class="line" marker-end="url(#ah6)"/>
<line x1="212" y1="100" x2="230" y2="100" class="line"/>
<line x1="212" y1="160" x2="230" y2="160" class="line"/>
<line x1="212" y1="215" x2="230" y2="215" class="line"/>
<rect x="455" y="15" width="290" height="300" rx="14" class="zone-ai"/>
<text x="475" y="45" class="hd ai">ANTHROPIC'S CLOUD</text>
<rect x="480" y="65" width="240" height="50" rx="10" class="box-ai"/>
<text x="600" y="95" text-anchor="middle">conversation 1 → model</text>
<rect x="480" y="140" width="240" height="40" rx="10" class="box-ai"/>
<text x="600" y="165" text-anchor="middle">conversation 2 → model</text>
<rect x="480" y="195" width="240" height="40" rx="10" class="box-ai"/>
<text x="600" y="220" text-anchor="middle">conversation 3 → model</text>
<line x1="212" y1="80" x2="478" y2="80" class="line" marker-start="url(#ah6)" marker-end="url(#ah6)"/>
<line x1="250" y1="150" x2="478" y2="150" class="line" marker-end="url(#ah6)"/>
<line x1="250" y1="205" x2="478" y2="205" class="line" marker-end="url(#ah6)"/>
<line x1="212" y1="150" x2="250" y2="150" class="line"/>
<line x1="212" y1="205" x2="250" y2="205" class="line"/>
<text x="345" y="72" text-anchor="middle" class="sm">own context</text>
<text x="345" y="142" text-anchor="middle" class="sm">own context</text>
<text x="345" y="197" text-anchor="middle" class="sm">own context</text>
</svg>
<figcaption>Figure 7. More agents means more model conversations, but all the commands still run on your machine.</figcaption>
</figure>

This matters for two reasons. Many subagents running builds at the same time can put real load on your machine. And each subagent only sends *its own* conversation to the model, which keeps every context small and focused.

---

## 7. Does My Hardware Make the Agent Faster?

Now we can answer the speed question with the picture from Figure 2. A task's time is split into three kinds of work:

1. **Model time:** the model reads the conversation and writes its reply. This happens on Anthropic's servers. **Your hardware has no effect here.**
2. **Network time:** sending each request and getting the reply. **Your internet connection** matters here.
3. **Tool time:** builds, tests, installs, searches. This happens on your machine. **Your CPU, RAM and disk matter here.**

<figure class="cc-fig">
<svg viewBox="0 0 760 250" role="img" aria-label="Timeline for a small website edit: mostly model time with tiny tool time. Timeline for a large .NET build-and-test task: large tool time blocks between model turns.">
<text x="20" y="30" class="hd">Small edit to a static website</text>
<rect x="20" y="45" width="140" height="30" class="seg-ai"/>
<rect x="160" y="45" width="10" height="30" class="seg-net"/>
<rect x="170" y="45" width="12" height="30" class="seg-mac"/>
<rect x="182" y="45" width="10" height="30" class="seg-net"/>
<rect x="192" y="45" width="160" height="30" class="seg-ai"/>
<rect x="352" y="45" width="10" height="30" class="seg-net"/>
<rect x="362" y="45" width="10" height="30" class="seg-mac"/>
<rect x="372" y="45" width="10" height="30" class="seg-net"/>
<rect x="382" y="45" width="150" height="30" class="seg-ai"/>
<text x="545" y="66" class="sm">→ almost all model time</text>
<text x="20" y="115" class="hd">Big .NET solution: build and run tests</text>
<rect x="20" y="130" width="110" height="30" class="seg-ai"/>
<rect x="130" y="130" width="10" height="30" class="seg-net"/>
<rect x="140" y="130" width="170" height="30" class="seg-mac"/>
<rect x="310" y="130" width="10" height="30" class="seg-net"/>
<rect x="320" y="130" width="110" height="30" class="seg-ai"/>
<rect x="430" y="130" width="10" height="30" class="seg-net"/>
<rect x="440" y="130" width="190" height="30" class="seg-mac"/>
<rect x="630" y="130" width="10" height="30" class="seg-net"/>
<rect x="640" y="130" width="100" height="30" class="seg-ai"/>
<text x="20" y="185" class="sm">→ big tool blocks: a faster machine helps here</text>
<rect x="20" y="210" width="18" height="16" class="seg-ai"/>
<text x="46" y="223" class="sm">model (Anthropic)</text>
<rect x="210" y="210" width="18" height="16" class="seg-net"/>
<text x="236" y="223" class="sm">network</text>
<rect x="330" y="210" width="18" height="16" class="seg-mac"/>
<text x="356" y="223" class="sm">tools (your machine)</text>
</svg>
<figcaption>Figure 8. Where the time goes depends on the task. Illustrative, not measured.</figcaption>
</figure>

| Your machine affects | Your machine does NOT affect |
|---|---|
| How fast builds, tests and installs run | How fast the model thinks and writes |
| How fast large repos are searched | How smart the answers are |
| How smoothly the app, browser pane and simulators run together | Which model you get (a new laptop and an old one get the same Opus) |

**Other things that change speed more than hardware:** the model you choose, fast mode and effort settings, how long the conversation has become, and your network.

---

## 8. Putting It All Together

Here is the whole flow in one list:

1. You type a request into Claude Code on your machine.
2. The app sends the conversation to the Anthropic API, with the model ID you picked (Opus 5.5, Fable 5.1, ...).
3. The model thinks **in Anthropic's cloud** and replies with text or a tool call.
4. The app runs the tool **on your machine** (local session) or **in a sandbox** (cloud session), after checking permissions.
5. The tool's output is added to the conversation and sent back to the model.
6. Steps 3–5 repeat until the model gives a final answer.

## 9. Cheat Sheet

| Question | Answer |
|---|---|
| Where does the model run? | Always on Anthropic's servers |
| Where do my commands and builds run? | On your machine in a local session; in a sandbox container in a cloud session |
| Can the model read my disk directly? | No. It only sees what the app puts into the conversation |
| What gets sent to Anthropic? | Your messages, the files the agent reads, command output, and the model's own replies |
| Does Opus vs Fable change the workflow? | No. It only changes which model answers |
| Does my hardware make the agent smarter? | No |
| Does my hardware make the agent faster? | Only for tool work (builds, tests, installs, searches) |
| What if a tool isn't installed on my machine? | The command fails in a local session, the same as if you ran it yourself |

**The one sentence to remember:** *the brain is in the cloud, the hands are where your session runs.*

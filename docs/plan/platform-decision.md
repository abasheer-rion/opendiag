# Platform decision, in plain words

Written 2026-11-20 for the owner. Full detail is in `architecture-v2.md`. Not legal advice.

## The decision

**OpenDiag is a Mac app first.** You install it, plug in your OBDLink CX or your WiFi ENET adapter, and it reads every fault code on the car and explains them in plain English. Windows and Linux come from the same code later.

## Why a Mac app

- **Both your adapters work.** The CX talks Bluetooth. The WiFi ENET adapter needs a kind of connection that a web page is not allowed to make. A real app is.
- **It is the cheapest path.** We reuse the code that already exists. Nothing new to install, no new programming language.
- **Reading is safe.** The public app has no ability to change anything on a car. That code is not in it at all.
- **A phone-only app would be slow to build.** Every change needs a real phone and a car. The fast ENET path is also the shakiest one on iPhones.

## What we are not doing now

| Not now | Why | When we would look again |
|---|---|---|
| iPhone or Android app | Slow to build, costs $99 a year for iPhone, weakest for ENET | If you tell us you work from a phone, and a one-week test in week 10 works |
| A fully web-only app | Cannot use your WiFi ENET adapter | Only as a free demo that anyone can try with a pretend car |
| The Rust and Tauri route | Needs new tools installed, two copies of the same code | If Bluetooth proves unstable on your Mac |
| Changing settings on a real car | You decided: bench modules only | Not in this plan |

## What you get that the three options each did best

- A **demo car** anyone can try in a browser. Good for strangers and for testing.
- A **safety wall**: writes live in a separate program that double-checks the backup, the battery voltage and the plan before it sends anything.
- A **screen that says what your adapter can and cannot do**, so nobody guesses.

## How it protects your settings

1. No change starts without a backup that was read twice and matched.
2. Changes only run on a bench module (a spare car part on your desk).
3. If the battery is low, the cable drops or the app is killed, it stops and offers to restore.
4. A test tries 100 ways to sneak a write through. Zero may succeed.

## Data, kept apart

Our own wording and the shared-licence data from the community project (OBDb) live in separate places with separate keys. The shared-licence pack is never inside the installer. You download it if you want it.

## What I need from you

1. **Do you work from a phone or a laptop at the car?** This is the one answer that could change the decision. Needed Nov 25.
2. **Exact names of your three adapters**, and whether one cable is an ENET cable. Needed Nov 25.
3. **Is it OK that "clear fault codes" waits for the bench?** Clearing is a write, and your rule says no writes on real cars.
4. **Apple's $99 fee:** say no unless you want to break the $200 cash goal.

## What is still unknown

- Whether the CX can talk to every module or only the engine. We find out in week 1.
- How fast things really are. First real timings come on Nov 25.
- The scores comparing the plans are my judgement, not measurements.

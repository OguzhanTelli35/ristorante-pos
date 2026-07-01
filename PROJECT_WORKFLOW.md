# Project Workflow Guide

Welcome to the project! This guide will explain how to start the application, make changes, test them, and safely save or undo your work using Git. 

## 1. How to Start the Project

To start the project in regular web mode (running both the backend server and the frontend web app simultaneously), open your terminal in the root folder of the project and run:

```bash
npm run dev
```

This will start up both servers and you can view the application in your browser.

## 2. How to Run Electron

If you want to run the project as a desktop application using Electron instead of a regular web browser, run this command:

```bash
npm run electron:dev
```

This will automatically launch the desktop application window.

## 3. What to do Before Making Changes

Before you start writing code or making any modifications, you should make sure your project is up-to-date and clean:

1. **Check your current status**: Run `git status` to make sure you don't have any uncommitted changes left over from previous work.
2. **Pull the latest changes**: If you are working with others or on multiple computers, run `git pull` to get the latest code.
3. **Plan your work**: Know exactly what file you want to edit and try to keep your changes focused on one feature or bug at a time.

## 4. How to Test Changes

Whenever you modify a file and save it:
1. The development servers (`npm run dev` or `npm run electron:dev`) will usually detect the changes and reload automatically.
2. **Manual Testing**: Always check the application visually. Click around the feature you just changed to ensure it works as expected and doesn't break anything else.
3. **Check the terminal**: Look at the terminal where your app is running to see if any errors or warnings popped up when you made the change.

## 5. What to do After Testing Changes

Once you are satisfied that your changes work correctly and no errors are present, it's time to save your work using Git. This is where you create a "save point" for your project.

## 6. How to Use Git for This Project

Git is a tool that tracks changes to your files. Here is the step-by-step process you should follow every time you want to save a completed change:

### Step A: See what changed
First, check which files you have modified.
```bash
git status
```
*Use this command anytime you want to see what files are currently modified and waiting to be saved.*

### Step B: Stage the changes
Tell Git that you want to include all your current modifications in the next save.
```bash
git add .
```
*(The period `.` means "all changed files in this folder"). Use this command when you are ready to prepare your files for saving.*

### Step C: Commit (Save) the changes
Create a permanent save point with a descriptive message.
```bash
git commit -m "message"
```
*Use this command to finalize the save. Always replace the message in quotes with a short, clear description of what you actually changed.*

### Step D: Push the changes
If your code is connected to an online repository (like GitHub), send your saved changes to the cloud.
```bash
git push
```
*Use this command to back up your work to the internet or share it with collaborators.*

## 7. How to Rollback if Something Breaks

Sometimes things go wrong. If you made a mistake and want to undo it, here is how you can rollback:

**Scenario A: You haven't committed (saved) yet**
If you made changes but haven't run `git commit` yet, and you want to throw away all your current unsaved modifications:
```bash
git restore .
```
*(Warning: This will permanently delete your recent unsaved work and revert the files back to the last commit).*

**Scenario B: You already committed (saved) but want to undo it**
If you want to completely erase the last commit you made and go back to how things were right before it:
```bash
git reset --hard HEAD~1
```
*(Warning: This deletes the most recent commit permanently. Only do this if you haven't run `git push` yet).*

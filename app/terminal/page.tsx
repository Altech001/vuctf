"use client"
import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { getChallenges } from "@/lib/challenge-utils"

interface TerminalLine {
  type: "command" | "output" | "error"
  content: string
  directory?: string
}

const initialFileSystem: Record<string, any> = {
  "/": {
    type: "directory",
    contents: {
      home: {
        type: "directory",
        contents: {
          user: {
            type: "directory",
            contents: {
              "flag.txt": {
                type: "file",
                content: "This is a sample flag file. Real flags are in challenges!",
              },
              "readme.txt": {
                type: "file",
                content:
                  "Welcome to VUCtf Terminal!\n\nAvailable commands:\n- ls: list files\n- cat <file>: read file\n- cd <dir>: change directory\n- pwd: print working directory\n- clear: clear terminal\n- help: show help\n- challenges: list available challenges\n- connect <id>: connect to challenge environment",
              },
            },
          },
        },
      },
      etc: {
        type: "directory",
        contents: {
          hosts: {
            type: "file",
            content: "127.0.0.1 localhost\n::1 localhost",
          },
        },
      },
    },
  },
}

export default function TerminalPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [currentPath, setCurrentPath] = useState("~")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [fileSystem, setFileSystem] = useState<Record<string, any>>(initialFileSystem)
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  useEffect(() => {
    const savedFS = localStorage.getItem("ctf_terminal_fs")
    if (savedFS) {
      try {
        setFileSystem(JSON.parse(savedFS))
      } catch (e) {
        console.error("Failed to load file system from localStorage")
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("ctf_terminal_fs", JSON.stringify(fileSystem))
  }, [fileSystem])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [lines])

  useEffect(() => {
    // Add welcome message
    if (lines.length === 0) {
      setLines([
        {
          type: "output",
          content: `VUCtf Terminal v1.0.0 - Welcome ${user?.username}!`,
        },
        {
          type: "output",
          content: `Type 'help' for available commands.\n`,
        },
      ])
    }
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [lines])

  const getDirectoryContents = (path: string) => {
    const parts = path.split("/").filter(Boolean)
    let current = fileSystem["/"]

    for (const part of parts) {
      if (current.contents && current.contents[part]) {
        current = current.contents[part]
      } else {
        return null
      }
    }

    return current
  }

  const getDirectoryForModification = (path: string) => {
    const parts = path.split("/").filter(Boolean)
    let current = fileSystem["/"]
    const pathArray = [fileSystem, "/"]

    for (const part of parts) {
      if (current.contents && current.contents[part]) {
        current = current.contents[part]
        pathArray.push(current)
      } else {
        return null
      }
    }

    return current
  }

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim()
    if (!trimmedCmd) {
      return ""
    }

    const parts = trimmedCmd.split(" ")
    const command = parts[0].toLowerCase()
    const args = parts.slice(1)

    let output = ""
    let isError = false

    switch (command) {
      case "help":
        output = `Available commands:
  ls              - List files and directories
  cat <file>      - Display file contents
  cd <directory>  - Change directory
  pwd             - Print working directory
  mkdir <dir>     - Create a new directory
  touch <file>    - Create a new empty file
  echo <text>     - Print text to terminal
  rm <file>       - Remove a file
  download <file> - Download a file to your computer
  upload          - Upload a file from your computer
  clear           - Clear terminal
  whoami          - Display current user
  date            - Display current date and time
  challenges      - List available CTF challenges
  connect <id>    - Connect to challenge environment
  help            - Show this help message`
        break

      case "ls":
        const dir = getDirectoryContents(currentPath === "~" ? "/home/user" : currentPath)
        if (dir && dir.type === "directory" && dir.contents) {
          output = Object.keys(dir.contents)
            .map((name) => {
              const item = dir.contents[name]
              return item.type === "directory" ? `${name}/` : name
            })
            .join("  ")
        } else {
          output = "Error: Not a directory"
          isError = true
        }
        break

      case "cat":
        if (args.length === 0) {
          output = "Usage: cat <filename>"
          isError = true
        } else {
          const fileName = args[0]
          const dir = getDirectoryContents(currentPath === "~" ? "/home/user" : currentPath)
          if (dir && dir.contents && dir.contents[fileName]) {
            const file = dir.contents[fileName]
            if (file.type === "file") {
              output = file.content
            } else {
              output = `cat: ${fileName}: Is a directory`
              isError = true
            }
          } else {
            output = `cat: ${fileName}: No such file or directory`
            isError = true
          }
        }
        break

      case "cd":
        if (args.length === 0) {
          setCurrentPath("~")
          output = ""
        } else {
          const targetPath = args[0]
          let newPath = currentPath === "~" ? "/home/user" : currentPath

          if (targetPath === "..") {
            const parts = newPath.split("/").filter(Boolean)
            parts.pop()
            newPath = "/" + parts.join("/")
            if (newPath === "/") newPath = "/"
          } else if (targetPath === "~") {
            newPath = "~"
          } else if (targetPath.startsWith("/")) {
            newPath = targetPath
          } else {
            newPath = newPath === "/" ? `/${targetPath}` : `${newPath}/${targetPath}`
          }

          if (newPath === "~") {
            setCurrentPath("~")
            output = ""
          } else {
            const dir = getDirectoryContents(newPath)
            if (dir && dir.type === "directory") {
              setCurrentPath(newPath)
              output = ""
            } else {
              output = `cd: ${targetPath}: No such file or directory`
              isError = true
            }
          }
        }
        break

      case "pwd":
        output = currentPath === "~" ? "/home/user" : currentPath
        break

      case "mkdir":
        if (args.length === 0) {
          output = "Usage: mkdir <directory_name>"
          isError = true
        } else {
          const dirName = args[0]
          const currentDir = getDirectoryForModification(currentPath === "~" ? "/home/user" : currentPath)

          if (currentDir && currentDir.type === "directory") {
            if (currentDir.contents[dirName]) {
              output = `mkdir: ${dirName}: File exists`
              isError = true
            } else {
              // Create new directory
              const newFS = { ...fileSystem }
              const dir = getDirectoryForModification(currentPath === "~" ? "/home/user" : currentPath)
              if (dir) {
                dir.contents[dirName] = {
                  type: "directory",
                  contents: {},
                }
                setFileSystem(newFS)
                output = ""
              }
            }
          } else {
            output = "mkdir: cannot create directory"
            isError = true
          }
        }
        break

      case "touch":
        if (args.length === 0) {
          output = "Usage: touch <filename>"
          isError = true
        } else {
          const fileName = args[0]
          const currentDir = getDirectoryForModification(currentPath === "~" ? "/home/user" : currentPath)

          if (currentDir && currentDir.type === "directory") {
            if (currentDir.contents[fileName] && currentDir.contents[fileName].type === "directory") {
              output = `touch: ${fileName}: Is a directory`
              isError = true
            } else {
              // Create or update file
              const newFS = { ...fileSystem }
              const dir = getDirectoryForModification(currentPath === "~" ? "/home/user" : currentPath)
              if (dir) {
                dir.contents[fileName] = {
                  type: "file",
                  content: dir.contents[fileName]?.content || "",
                }
                setFileSystem(newFS)
                output = ""
              }
            }
          } else {
            output = "touch: cannot create file"
            isError = true
          }
        }
        break

      case "rm":
        if (args.length === 0) {
          output = "Usage: rm <filename>"
          isError = true
        } else {
          const fileName = args[0]
          const currentDir = getDirectoryForModification(currentPath === "~" ? "/home/user" : currentPath)

          if (currentDir && currentDir.type === "directory") {
            if (!currentDir.contents[fileName]) {
              output = `rm: ${fileName}: No such file or directory`
              isError = true
            } else if (currentDir.contents[fileName].type === "directory") {
              output = `rm: ${fileName}: Is a directory (use rmdir)`
              isError = true
            } else {
              // Remove file
              const newFS = { ...fileSystem }
              const dir = getDirectoryForModification(currentPath === "~" ? "/home/user" : currentPath)
              if (dir) {
                delete dir.contents[fileName]
                setFileSystem(newFS)
                output = ""
              }
            }
          } else {
            output = "rm: cannot remove file"
            isError = true
          }
        }
        break

      case "upload":
        fileInputRef.current?.click()
        output = "Opening file picker..."
        break

      case "whoami":
        output = user?.username || "guest"
        break

      case "date":
        output = new Date().toString()
        break

      case "echo":
        const echoText = args.join(" ")
        const redirectMatch = echoText.match(/^(.+?)\s*>\s*(.+)$/)

        if (redirectMatch) {
          const [, text, fileName] = redirectMatch
          const currentDir = getDirectoryForModification(currentPath === "~" ? "/home/user" : currentPath)

          if (currentDir && currentDir.type === "directory") {
            const newFS = { ...fileSystem }
            const dir = getDirectoryForModification(currentPath === "~" ? "/home/user" : currentPath)
            if (dir) {
              dir.contents[fileName.trim()] = {
                type: "file",
                content: text.trim(),
              }
              setFileSystem(newFS)
              output = ""
            }
          } else {
            output = "echo: cannot write to file"
            isError = true
          }
        } else {
          output = echoText
        }
        break

      case "challenges":
        const challenges = getChallenges()
        output = `Available CTF Challenges:\n\n${challenges
          .map(
            (c) =>
              `[${c.id}] ${c.title} (${c.category}) - ${c.points} pts\n    ${c.description.split("\n")[0].substring(0, 60)}...`,
          )
          .join("\n\n")}\n\nUse 'connect <id>' to access a challenge environment.`
        break

      case "connect":
        if (args.length === 0) {
          output = "Usage: connect <challenge_id>"
          isError = true
        } else {
          const challengeId = args[0]
          const challenges = getChallenges()
          const challenge = challenges.find((c) => c.id === challengeId)
          if (challenge) {
            output = `Connecting to challenge: ${challenge.title}\n\nChallenge Environment:\n- Category: ${challenge.category}\n- Difficulty: ${challenge.difficulty}\n- Points: ${challenge.points}\n\nEnvironment ready! You can now work on this challenge.\nVisit /challenges/${challengeId} for full details.`
          } else {
            output = `Error: Challenge ${challengeId} not found`
            isError = true
          }
        }
        break

      case "download":
        if (args.length === 0) {
          output = "Usage: download <filename>"
          isError = true
        } else {
          const fileName = args[0]
          const dir = getDirectoryContents(currentPath === "~" ? "/home/user" : currentPath)
          if (dir && dir.contents && dir.contents[fileName]) {
            const file = dir.contents[fileName]
            if (file.type === "file") {
              // Trigger file download
              const blob = new Blob([file.content], { type: "text/plain" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = fileName
              a.click()
              URL.revokeObjectURL(url)
              output = `Downloading ${fileName}...`
            } else {
              output = `download: ${fileName}: Is a directory`
              isError = true
            }
          } else {
            output = `download: ${fileName}: No such file or directory`
            isError = true
          }
        }
        break

      case "clear":
        setLines([])
        return { output: "", isError: false }

      default:
        output = `zsh: command not found: ${command}`
        isError = true
    }

    return { output, isError }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const fileName = file.name

      const currentDir = getDirectoryForModification(currentPath === "~" ? "/home/user" : currentPath)
      if (currentDir && currentDir.type === "directory") {
        const newFS = { ...fileSystem }
        const dir = getDirectoryForModification(currentPath === "~" ? "/home/user" : currentPath)
        if (dir) {
          dir.contents[fileName] = {
            type: "file",
            content: content,
          }
          setFileSystem(newFS)

          // Add success message to terminal
          setLines((prev) => [
            ...prev,
            {
              type: "output",
              content: `File '${fileName}' uploaded successfully (${file.size} bytes)`,
            },
          ])
        }
      }
    }
    reader.readAsText(file)

    // Reset file input
    e.target.value = ""
  }

  const clearTerminal = () => {
    setLines([])
  }

  const downloadHistory = () => {
    const content = lines.map((line) => (line.type === "command" ? `$ ${line.content}` : line.content)).join("\n")
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `terminal-history-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const cmd = currentInput
      setCurrentInput("")
      const { output, isError } = executeCommand(cmd)
      setLines((prev) => [
        ...prev,
        { type: "command", content: cmd, directory: currentPath },
        { type: isError ? "error" : "output", content: output },
      ])
    } else if (e.key === "ArrowUp") {
      if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1)
        setCurrentInput(commandHistory[historyIndex - 1])
      }
    } else if (e.key === "ArrowDown") {
      if (historyIndex < commandHistory.length - 1) {
        setHistoryIndex(historyIndex + 1)
        setCurrentInput(commandHistory[historyIndex + 1])
      } else if (historyIndex === commandHistory.length - 1) {
        setHistoryIndex(historyIndex + 1)
        setCurrentInput("")
      }
    }
  }

  if (!user) {
    return null
  }

  const getDirectoryName = () => {
    if (currentPath === "~") return "~"
    const parts = currentPath.split("/").filter(Boolean)
    return parts[parts.length - 1] || "/"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept="*/*" />
      <div className="py-4">
        <Card className="bg-black/95 border-primary/20 overflow-hidden">
          <CardContent className="p-0">
            <div
              className="bg-black p-6 font-mono text-sm min-h-[600px] max-h-[700px] overflow-y-auto"
              onClick={() => inputRef.current?.focus()}
            >
              {/* Render previous lines */}
              {lines.map((line, index) => (
                <div key={index} className="mb-1">
                  {line.type === "command" ? (
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">➜</span>
                      <span className="text-cyan-400">{line.directory || "~"}</span>
                      <span className="text-white ml-2">{line.content}</span>
                    </div>
                  ) : (
                    <div className={`whitespace-pre-wrap ${line.type === "error" ? "text-red-400" : "text-gray-300"}`}>
                      {line.content}
                    </div>
                  )}
                </div>
              ))}

              {/* Current input line */}
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">➜</span>
                <span className="text-cyan-400">{getDirectoryName()}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-white ml-2 caret-white"
                  style={{ caretShape: "block" }}
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>

              <div ref={terminalEndRef} />
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-sm text-muted-foreground text-center">
          <p>
            Press <kbd className="px-2 py-1 bg-muted rounded">↑</kbd>{" "}
            <kbd className="px-2 py-1 bg-muted rounded">↓</kbd> for history •{" "}
            <kbd className="px-2 py-1 bg-muted rounded">Tab</kbd> for completion •{" "}
            <kbd className="px-2 py-1 bg-muted rounded">Ctrl+L</kbd> to clear • Type{" "}
            <kbd className="px-2 py-1 bg-muted rounded">help</kbd> for commands
          </p>
        </div>
      </div>
    </div>
  )
}

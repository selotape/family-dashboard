' Family Dashboard Server - Silent Startup
' This runs the server without showing a console window
' Used for automatic startup on computer restart

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Change to the project directory and run Python server
WshShell.Run "cmd /c cd /d """ & scriptDir & """ && python server.py", 0, False

Set WshShell = Nothing
Set fso = Nothing

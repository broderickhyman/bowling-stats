using BackupParser;
using CommandLine;

Parser
  .Default
  .ParseArguments<CommandLineOptions>(args)
  .WithParsed(Execute);
return;

void Execute(CommandLineOptions options)
{
  Console.WriteLine($"Path: {options.Path}");

  using var readStream = File.OpenRead(options.Path);
  var newFileName = Path.ChangeExtension(options.Path, ".db");
  var startPosition = FindStartPosition(readStream);
  if (startPosition < 0)
  {
    throw new Exception("Could not parse the file");
  }

  using var writeStream = File.OpenWrite(newFileName);
  readStream.Seek(startPosition, SeekOrigin.Begin);
  readStream.CopyTo(writeStream);
}

long FindStartPosition(FileStream readStream)
{
  var currentByte = readStream.ReadByte();
  const string searchString = "SQLite format 3";
  var currentSearchIndex = 0;
  while (currentByte >= 0)
  {
    var character = (char)currentByte;
    if (character == searchString[currentSearchIndex])
    {
      currentSearchIndex++;
    }
    else if (currentSearchIndex > 0)
    {
      currentSearchIndex = 0;
    }
    if (currentSearchIndex >= searchString.Length)
    {
      return readStream.Position - searchString.Length;
    }
    currentByte = readStream.ReadByte();
  }

  return -1;
}
using CommandLine;

namespace BackupParser
{
  internal class CommandLineOptions
  {
    [Option('p', "path", Required = true, HelpText = "Path to the .pinpal file")]
    public string? Path { get; set; }
  }
}

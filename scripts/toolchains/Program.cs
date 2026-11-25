using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices.JavaScript;
using System.Runtime.Loader;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

public static partial class Program
{
    public static void Main() { }

    [JSExport]
    public static async Task<string> Run(string source, string referenceNames)
    {
        var references = referenceNames.Split('\n', StringSplitOptions.RemoveEmptyEntries)
            .Select(name => MetadataReference.CreateFromFile("/references/" + name + ".dll"));
        var compilation = CSharpCompilation.Create(
            "WebWriterSnippet",
            new[] { CSharpSyntaxTree.ParseText(source) },
            references,
            new CSharpCompilationOptions(OutputKind.ConsoleApplication, concurrentBuild: false));
        using var content = new MemoryStream();
        var compiled = compilation.Emit(content);
        if (!compiled.Success)
            throw new InvalidOperationException(string.Join("\n", compiled.Diagnostics.Where(d => d.Severity == DiagnosticSeverity.Error)));
        content.Position = 0;
        var original = Console.Out;
        var originalError = Console.Error;
        using var output = new StringWriter();
        Console.SetOut(output);
        Console.SetError(output);
        try
        {
            var entry = AssemblyLoadContext.Default.LoadFromStream(content).EntryPoint!;
            if (entry.Invoke(null, entry.GetParameters().Length == 0 ? null : new object[] { Array.Empty<string>() }) is Task task)
                await task;
            return output.ToString();
        }
        catch (TargetInvocationException error) when (error.InnerException != null)
        {
            throw new InvalidOperationException(error.InnerException.Message, error.InnerException);
        }
        finally
        {
            Console.SetOut(original);
            Console.SetError(originalError);
        }
    }
}

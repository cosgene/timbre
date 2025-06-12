using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

var builder = WebApplication.CreateBuilder(args);

FileStream passwordFile = File.Open("pass.txt", FileMode.Open);
if (!passwordFile.CanRead)
{
    Console.WriteLine("Can't access file's contents \"pass.txt\"");
    return;
}

byte[] buffer = new byte[1024];
int rc = passwordFile.Read(buffer, 0, 1024);
string? password = System.Text.Encoding.Default.GetString(buffer, 0, rc);

passwordFile.Close();

string? connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
connectionString = connectionString?.Replace("PASSWORDHERE", password);

// Добавление контекста БД
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));


// Разрешить все источники (для разработки)
builder.Services.AddCors(options =>
{
    options.AddPolicy("NextJsCors", policy => 
    {
        policy.WithOrigins("http://localhost:3000") // Адрес Next.js
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Для SignalR
    });
});

builder.Services.AddControllers();

builder.Services.AddSignalR();

builder.Services.AddScoped<IMessageService, MessageService>();


// Остальные сервисы...
var app = builder.Build();

app.UseRouting();

app.MapControllers();

app.MapHub<ChatHub>("/chatHub");

app.UseCors("NextJsCors");
app.Run();
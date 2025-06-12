using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

var builder = WebApplication.CreateBuilder(args);

FileStream passwordFile = File.Open("pass.txt", FileMode.Open);
if (!passwordFile.CanRead)
{
    Console.WriteLine("Can't access file's contents \"pass.txt\" with database user password.");
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
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();

// Остальные сервисы...
var app = builder.Build();

// var builder = WebApplication.CreateBuilder(args);

// // Add services to the container.
// builder.Services.AddRazorPages();

// var app = builder.Build();

// Configure the HTTP request pipeline.
// if (!app.Environment.IsDevelopment())
// {
//     app.UseExceptionHandler("/Error");
//     // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
//     app.UseHsts();
// }

// app.UseHttpsRedirection();

// app.UseRouting();

// app.UseAuthorization();

// app.MapStaticAssets();
// app.MapRazorPages()
//    .WithStaticAssets();

app.UseRouting();

app.MapControllers();

app.UseCors("AllowAll");
app.Run();
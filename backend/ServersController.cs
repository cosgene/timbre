using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ServersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ServersController> _logger;

    public ServersController(AppDbContext context, ILogger<ServersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreateServer(CreateServerRequest request)
    {
        try
        {

            // Создание сервера
            var server = new Server
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Name = request.Name,
                ImageUrl = request.ImageUrl,
                InviteCode = Guid.NewGuid(),
                Channels = request.Channels.Select(c => new Channel
                {
                    Id = Guid.NewGuid(),
                    Name = c.Name,
                    Type = c.Type
                }).ToList()
            };

            // Сохранение в БД
            _context.Servers.Add(server);
            await _context.SaveChangesAsync();

            // Возвращаем созданный объект
            return CreatedAtAction(nameof(GetServer), new { id = server.Id }, server);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating server");
            return StatusCode(500, "Internal server error");
        }
    }

    // Вспомогательный метод для получения сервера (для CreatedAtAction)
    [HttpGet("{id}")]
    public async Task<ActionResult<Server>> GetServer(Guid id)
    {
        var server = await _context.Servers
            .Include(s => s.Channels)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (server == null) return NotFound();
        return server;
    }

    [HttpGet]
    public async Task<ActionResult<List<Server>>> GetServers()
    {
        var servers = await _context.Servers.ToListAsync();
        return servers;
    }
}
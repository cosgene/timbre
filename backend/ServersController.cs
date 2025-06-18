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
                    //Type = c.Type
                }).ToList(),

                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var profile = _context.Profiles.FirstOrDefault(p => p.Id == request.UserId);
            if (profile == null)
            {
                _logger.LogError(new NullReferenceException(), $"Profile {request.UserId} is not registerd in the database");
                return StatusCode(500, "Internal server error");
            }

            // Создатель сервера добавляется как его участник (админ)
            var member = new Member
            {
                Id = Guid.NewGuid(),
                Role = "Админ",
                Profile = profile,
                //ProfileId = request.UserId,
                ServerId = server.Id,

                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            profile.Members.Add(member);
            profile.Servers.Add(server);
            server.Members.Add(member);

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
            .Include(s => s.Members)
                .ThenInclude(s => s.Profile)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (server == null) return NotFound();
        return server;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> EditServer(Guid id, EditServerRequest request)
    {
        var server = await _context.Servers
            .FirstOrDefaultAsync(s => s.Id == id);

        if (server == null) return NotFound();

        server.Name = request.Name;
        server.ImageUrl = request.ImageUrl;

        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("{id}/leave/{profileId}")]
    public async Task<IActionResult> UserLeaveServer(Guid id, Guid profileId)
    {
        var server = await _context.Servers
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (server == null) return NotFound("Server not found.");

        var profile =   _context.Profiles
                        .Include(s => s.Servers)
                        .Include(s => s.Members)
                        .FirstOrDefault(s => s.Id == profileId);
        
        if (profile == null) return NotFound("Profile not found.");

        var serverToRemove = profile.Servers.FirstOrDefault(s => s.Id == id);
        if (serverToRemove != null)
        {
            profile.Servers.Remove(serverToRemove);
        }

        var membersToRemove = profile.Members.Where(s => s.ServerId == id);
        _context.Members.RemoveRange(membersToRemove);

        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteServer(Guid id)
    {
        var server = await _context.Servers
                    .Include(s => s.Channels)
                    .Include(s => s.Members)
                    .FirstOrDefaultAsync(s => s.Id == id);

        if (server == null) return NotFound();

        var channelsToRemove = _context.Channels.Where(c => c.ServerId == id);
        _context.Channels.RemoveRange(channelsToRemove);

        var membersToRemove = _context.Members.Where(m => m.ServerId == id);
        _context.Members.RemoveRange(membersToRemove);

        var profiles = await _context.Profiles.Include(p => p.Servers).ToListAsync();
        foreach (var profile in profiles)
        {
            var serverToRemove = profile.Servers.FirstOrDefault(s => s.Id == id);
            if (serverToRemove != null)
            {
                profile.Servers.Remove(serverToRemove);
            }
        }
        
        // Удаляем сам сервер
        _context.Servers.Remove(server);

        // Сохраняем изменения
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet]
    public async Task<ActionResult<List<Server>>> GetServers()
    {
        var servers = await _context.Servers.ToListAsync();
        return servers;
    }

    [HttpPost("{serverId}/channels/")]
    public async Task<IActionResult> CreateChannel(CreateChannelRequest request)
    {
        try
        {

            // Создание сервера
            var channel = new Channel
            {
                Id = Guid.NewGuid(),
                //ProfileId = request.ProfileId,
                Name = request.Name,
                Type = request.Type,
                //Type = ChannelType.Text,
                ServerId = request.ServerId,

                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Сохранение в БД
            var server = await _context.Servers
                .Include(s => s.Channels)
                .FirstOrDefaultAsync(s => s.Id == request.ServerId);

            var profile = _context.Profiles.FirstOrDefault(p => p.Id == request.ProfileId);
            if (profile == null)
            {
                _logger.LogError(new NullReferenceException(), $"Profile {request.ProfileId} is not registerd in the database");
                return StatusCode(500, "Internal server error");
            }

            profile.Channels.Add(channel);
            server!.Channels.Add(channel);
            _context.Channels.Add(channel);
            await _context.SaveChangesAsync();

            // Возвращаем созданный объект
            return CreatedAtAction(nameof(GetChannel), new { serverId = channel.ServerId, channelId = channel.Id }, channel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating channel");
            return StatusCode(500, "Internal server channel");
        }
    }

    [HttpGet("{serverId}/channels/{channelId}")]
    public async Task<ActionResult<Channel>> GetChannel(Guid serverId, Guid channelId)
    {
        var server = await _context.Servers
            .Include(s => s.Channels)
            .FirstOrDefaultAsync(s => s.Id == serverId);

        if (server == null) return NotFound();

        var channel = server.Channels.FirstOrDefault(c => c.Id == channelId);
        if (channel == null) return NotFound();

        return channel;
    }

    [HttpGet("{serverId}/channels")]
    public async Task<ActionResult<List<Channel>>> GetChannels(Guid serverId)
    {
        var server = await _context.Servers
            .Include(s => s.Channels)
            .FirstOrDefaultAsync(s => s.Id == serverId);

        if (server == null) return NotFound();

        return server.Channels.ToList();
    }
}
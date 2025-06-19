using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ProfilesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ProfilesController> _logger;

    public ProfilesController(AppDbContext context, ILogger<ProfilesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreateProfile(CreateProfileRequest request)
    {
        try
        {

            // Создание сервера
            var profile = new Profile
            {
                Id = Guid.NewGuid(),
                UserId = request.ClerkId,
                Name = request.Name,
                ImageURL = request.ImageURL,
                Email = request.Email,

                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Сохранение в БД
            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();

            // Возвращаем созданный объект
            return CreatedAtAction(nameof(GetProfile), new { id = profile.Id }, profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating profile");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Profile>> GetProfile(Guid id)
    {
        var profile = await _context.Profiles
            //.Include(s => s.Servers)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (profile == null) return NotFound();
        return profile;
    }

    [HttpGet("fromClerk/{clerkId}")]
    public async Task<ActionResult<Profile>> GetProfileFromClerk(string clerkId)
    {
        var profile = await _context.Profiles
            //.Include(s => s.Servers)
            .FirstOrDefaultAsync(s => s.UserId == clerkId);

        if (profile == null) return NotFound();

        // // I will burn in hell for my sins
        // // but it doesnt work otherwise
        // var dbServers = await _context.Servers.ToListAsync();
        // var servers = new List<Server>();
        // foreach (var member in profile.Members)
        // {
        //     var a = dbServers.FirstOrDefault(s => s.Id == member.ServerId);
        //     if (a == null) continue;
        //     servers.Add(a);
        // }
        // profile.Servers = servers;

        return profile;
    }

    [HttpGet("{id}/getServers")]
    public async Task<ActionResult<List<Server>>> GetProfileServers(Guid id)
    {
        var profile = await _context.Profiles
            .Include(s => s.Members)
                .ThenInclude(s => s.Server)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (profile == null) return NotFound();

        var servers = profile.Members.Select(m => m.Server).ToList();
        Console.WriteLine("GetProfileServers " + servers.Count);
        foreach (var a in servers)
        {
            Console.WriteLine("Server " + a.Name);
        }

        return servers;
    }

    [HttpPut("{profileId}")]
    public async Task<IActionResult> EditProfile(Guid profileId, EditChannelRequest request)
    {
        var profile = await _context.Profiles
            .FirstOrDefaultAsync(s => s.Id == profileId);

        if (profile == null) return NotFound("Profile " + profileId + " not found.");

        profile.Name = request.Name;

        await _context.SaveChangesAsync();

        return Ok();
    }
}
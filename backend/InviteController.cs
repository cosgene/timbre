using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class InviteController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<InviteController> _logger;

    public InviteController(AppDbContext context, ILogger<InviteController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("{inviteId}")]
    public async Task<ActionResult<Server>> JoinInvitation(Guid inviteId, JoinInvitationRequest request)
    {
        var server = await _context.Servers
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.InviteCode == inviteId);


        if (server == null) return NotFound("Server with this invite code not found.");

        var profile = await _context.Profiles
            .FirstOrDefaultAsync(s => s.Id == request.profileId);

        if (profile == null) return NotFound("Profile " + request.profileId + " not found.");

        var membersWithThisProfileId = server.Members
            .FirstOrDefault(s => s.ProfileId == request.profileId);

        if (membersWithThisProfileId != null) return BadRequest("This member is already on this server.");

        var member = new Member
        {
            Id = Guid.NewGuid(),
            Role = "Гость",
            Profile = profile,
            //ProfileId = request.UserId,
            Server = server,
            ServerId = server.Id,

            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        profile.Members.Add(member);
        //profile.Servers.Add(server);
        server.Members.Add(member);

        _context.Members.Add(member);

        await _context.SaveChangesAsync();

        return server;
    }
}
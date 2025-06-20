using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{ 
    private readonly AppDbContext _context;
    private readonly ILogger<MessagesController> _logger;

    public MessagesController(AppDbContext context, ILogger<MessagesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Message>> GetMessage(Guid id)
    {
        var message = await _context.Messages
            .FirstOrDefaultAsync(s => s.Id == id);

        if (message == null) return NotFound();
        return message;
    }

    [HttpPost("send")]
    public async Task<IActionResult> CreateMessage(CreateMessageRequest request)
    {
        try
        {
            var member = _context.Members
                .FirstOrDefault(s => s.Id == request.OwnerId);

            if (member == null) return NotFound("Member " + request.OwnerId + " not found.");

            // Создание сервера
            var message = new Message
            {
                Id = Guid.NewGuid(),
                Member = member,
                MemberId = member.Id,
                ChannelId = request.ChannelId,
                Content = request.Content,

                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Сохранение в БД
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Возвращаем созданный объект
            return CreatedAtAction(nameof(GetMessage), new { id = message.Id }, message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating message");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("channel/{channelId}")]
    public async Task<ActionResult<List<Message>>> GetChannelMessages(Guid channelId)
{
    var messages = await _context.Messages
        .Include(m => m.Member)
            .ThenInclude(member => member.Profile)
        .Where(m => m.ChannelId == channelId && m.Member.Profile != null)
        .OrderBy(m => m.CreatedAt)
        .ToListAsync();

    return messages;
}
}


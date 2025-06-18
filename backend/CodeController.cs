using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class CodeController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<CodeController> _logger;

    public CodeController(AppDbContext context, ILogger<CodeController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("save")]
    public async Task<IActionResult> SaveCode(CreateCodeRequest request)
    {
        var code = _context.CodeSessions
                    .FirstOrDefault(s => s.ServerId == request.ServerId && s.ChannelId == request.ChannelId);
        if (code != null)
        {
            code.Text = request.Text;
            code.Language = request.Language;

            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCode), new { id = code.Id }, code);
        }

        try
        {

            // Создание сервера
            code = new Code
            {
                Id = Guid.NewGuid(),
                ServerId = request.ServerId,
                ChannelId = request.ChannelId,
                Text = request.Text,
                Language = request.Language
            };

            // Сохранение в БД
            _context.CodeSessions.Add(code);
            await _context.SaveChangesAsync();

            // Возвращаем созданный объект
            return CreatedAtAction(nameof(GetCode), new { id = code.Id }, code);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating code session");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Code>> GetCode(Guid id)
    {
        var code = await _context.CodeSessions
            .FirstOrDefaultAsync(s => s.Id == id);

        if (code == null) return NotFound();
        return code;
    }

    [HttpGet("fromServer/{serverId}/{channelId}")]
    public async Task<ActionResult<Code>> GetCodeFromServer(Guid serverId, Guid channelId)
    {
        var code = await _context.CodeSessions
            .FirstOrDefaultAsync(s => s.ServerId == serverId && s.ChannelId == channelId);

        if (code == null) return NotFound();
        return code;
    }
}
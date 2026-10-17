export default async (request) => {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Thiếu OPENAI_API_KEY trong Netlify environment variables.' }, { status: 503 });
  }
  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: 'Request body không hợp lệ.' }, { status: 400 });
  }
  const answer = String(body.answer || '').trim().slice(0, 4000);
  if (!answer) return Response.json({ error: 'Vui lòng gửi câu trả lời trước.' }, { status: 400 });
  const model = process.env.OPENAI_MODEL || 'gpt-6-luna';
  const instructions = `Bạn là gia sư tiếng Anh cá nhân cho người Việt, tập trung giao tiếp tự nhiên trong đời sống, du lịch và công việc. Phản hồi bằng tiếng Việt, giữ ví dụ tiếng Anh. Người học cần tự thử trước; giờ họ đã gửi câu trả lời nên hãy chữa kỹ nhưng khích lệ. Dựa vào ngữ cảnh, không tự động coi mọi cách nói khác câu mẫu là sai. Trình bày theo thứ tự: 1) Đánh giá nhanh câu có hiểu được không; 2) Lỗi cụ thể từng điểm (nếu không có lỗi thì nói rõ); 3) Bản sửa tối thiểu giữ nguyên ý; 4) Bản nói tự nhiên như người bản xứ trong đúng ngữ cảnh; 5) Giải thích bằng tiếng Việt vì sao; 6) Dịch nghĩa tiếng Việt; 7) IPA cho câu tự nhiên (nếu có thể chính xác; dùng IPA Mỹ); 8) Một câu hỏi tiếp theo bằng tiếng Anh để người học phải tiếp tục hội thoại. Không đưa đáp án trước khi có câu trả lời; không bịa lỗi; không chấm phát âm từ văn bản. Nêu rõ phần phát âm không thể đánh giá nếu chỉ có chữ viết.`;
  const input = `Ngữ cảnh: ${String(body.scenario || '').slice(0, 1000)}\nLời thoại đối phương: ${String(body.prompt || '').slice(0, 1000)}\nBài học: ${String(body.lesson || '').slice(0, 300)}\nCâu người học: ${answer}`;
  try {
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, instructions, input, max_output_tokens: 900 })
    });
    const result = await upstream.json();
    if (!upstream.ok) {
      return Response.json({ error: result?.error?.message || 'OpenAI API request failed.' }, { status: upstream.status });
    }
    const feedback = result.output_text || (result.output || []).flatMap(x => x.content || []).map(x => x.text || '').join('\n');
    return Response.json({ feedback });
  } catch (error) {
    return Response.json({ error: 'Không kết nối được dịch vụ AI. Vui lòng thử lại.' }, { status: 502 });
  }
};

import axiosInstance from "@/lib/axios";

interface AIPreviousMessage {
  content: string;
  type: string;
  senderId: string;
  senderName?: string;
}

interface AIEnhanceRequest {
  message: string;
  previousMessages?: AIPreviousMessage[];
}

interface AIGenerateRequest {
  prompt: string;
}

interface AISummarizeRequest {
  text: string;
  maxLength?: string;
  previousMessages?: AIPreviousMessage[];
}

interface AIFreestyleRequest {
  prompt: string;
  systemPrompt?: string;
}

class AiService {
  /**
   * Cải thiện nội dung tin nhắn với AI
   */
  async enhanceMessage(
    message: string,
    previousMessages: AIPreviousMessage[] = [],
  ): Promise<string> {
    try {
      const payload: AIEnhanceRequest = {
        message,
        previousMessages,
      };

      const response = await axiosInstance.post("/ai/enhance", payload);
      console.log("response enhance", response.data);

      if (!response.data) {
        throw new Error("Không nhận được phản hồi từ API");
      }

      // Kiểm tra các định dạng dữ liệu trả về có thể có
      if (typeof response.data === "string") {
        return response.data;
      }

      if (response.data.enhancedMessage) {
        return response.data.enhancedMessage;
      }

      if (response.data.result) {
        return typeof response.data.result === "string"
          ? response.data.result
          : JSON.stringify(response.data.result);
      }

      if (response.data.response) {
        return typeof response.data.response === "string"
          ? response.data.response
          : JSON.stringify(response.data.response);
      }

      // Trả về message gốc nếu không tìm thấy định dạng phù hợp
      return message;
    } catch (error) {
      console.error("Lỗi khi cải thiện tin nhắn:", error);
      throw error;
    }
  }

  /**
   * Tạo phản hồi mới với AI
   */
  async generateResponse(prompt: string): Promise<string> {
    try {
      const payload: AIGenerateRequest = {
        prompt,
      };

      const response = await axiosInstance.post("/ai/generate", payload);
      console.log("response generateResponse", response.data);

      if (!response.data) {
        throw new Error("Không nhận được phản hồi từ API");
      }

      // Kiểm tra các định dạng dữ liệu trả về có thể có
      if (typeof response.data === "string") {
        return response.data;
      }

      if (response.data.generatedText) {
        return response.data.generatedText;
      }

      if (response.data.result) {
        return typeof response.data.result === "string"
          ? response.data.result
          : JSON.stringify(response.data.result);
      }

      if (response.data.response) {
        return typeof response.data.response === "string"
          ? response.data.response
          : JSON.stringify(response.data.response);
      }

      // Trả về chuỗi rỗng nếu không tìm thấy định dạng phù hợp
      return "";
    } catch (error) {
      console.error("Lỗi khi tạo phản hồi:", error);
      throw error;
    }
  }

  /**
   * Tóm tắt nội dung với AI
   */
  async summarizeText(
    text: string,
    maxLength: number = 100,
    previousMessages: AIPreviousMessage[] = [],
  ): Promise<string> {
    try {
      const payload: AISummarizeRequest = {
        text,
        maxLength: maxLength.toString(),
        previousMessages,
      };

      const response = await axiosInstance.post("/ai/summarize", payload);

      if (!response.data) {
        throw new Error("Không nhận được phản hồi từ API");
      }

      // Kiểm tra các định dạng dữ liệu trả về có thể có
      if (typeof response.data === "string") {
        return response.data;
      }

      if (response.data.summary) {
        return response.data.summary;
      }

      if (response.data.result) {
        return typeof response.data.result === "string"
          ? response.data.result
          : JSON.stringify(response.data.result);
      }

      if (response.data.response) {
        return typeof response.data.response === "string"
          ? response.data.response
          : JSON.stringify(response.data.response);
      }

      // Trả về chuỗi rỗng nếu không tìm thấy định dạng phù hợp
      return "";
    } catch (error) {
      console.error("Lỗi khi tóm tắt nội dung:", error);
      throw error;
    }
  }

  /**
   * Tùy chỉnh prompt tự do với AI
   */
  async freestyle(prompt: string, systemPrompt: string = ""): Promise<string> {
    try {
      const payload: AIFreestyleRequest = {
        prompt,
        systemPrompt,
      };

      const response = await axiosInstance.post("/ai/freestyle", payload);
      console.log("response freestyle", response.data);

      if (!response.data) {
        throw new Error("Không nhận được phản hồi từ API");
      }

      // Kiểm tra các định dạng dữ liệu trả về có thể có
      if (typeof response.data === "string") {
        return response.data;
      }

      if (response.data.response) {
        return typeof response.data.response === "string"
          ? response.data.response
          : JSON.stringify(response.data.response);
      }

      if (response.data.result) {
        return typeof response.data.result === "string"
          ? response.data.result
          : JSON.stringify(response.data.result);
      }

      // Trả về chuỗi rỗng nếu không tìm thấy định dạng phù hợp
      return "";
    } catch (error) {
      console.error("Lỗi khi xử lý yêu cầu tùy chỉnh:", error);
      throw error;
    }
  }
}

export const aiService = new AiService();

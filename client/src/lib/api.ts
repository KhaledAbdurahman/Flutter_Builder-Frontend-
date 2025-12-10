import axios, { AxiosInstance } from "axios";

interface Project {
  id: number;
  name: string;
  description: string;
  json_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface GenerationResponse {
  id: number;
  project_id: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

interface QuickGenerateRequest {
  app_name: string;
  package_name: string;
  json_data: Record<string, any>;
}

class FlutterBuilderAPI {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = "http://localhost:8000/api") {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Create a new project
   */
  async createProject(
    data: Omit<Project, "id" | "created_at" | "updated_at">
  ): Promise<Project> {
    try {
      const response = await this.client.post<Project>("/projects/", data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetch all projects
   */
  async getProjects(): Promise<Project[]> {
    try {
      const response = await this.client.get<Project[]>("/projects/");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetch a single project by ID
   */
  async getProject(id: number): Promise<Project> {
    try {
      const response = await this.client.get<Project>(`/projects/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update a project
   */
  async updateProject(
    id: number,
    data: Partial<Omit<Project, "id" | "created_at" | "updated_at">>
  ): Promise<Project> {
    try {
      const response = await this.client.patch<Project>(
        `/projects/${id}/`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: number): Promise<void> {
    try {
      await this.client.delete(`/projects/${id}/`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate Flutter project from saved project
   */
  async generateProject(id: number): Promise<GenerationResponse> {
    try {
      const response = await this.client.post<GenerationResponse>(
        `/projects/${id}/generate/`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Download generated Flutter project as ZIP
   */
  async downloadProject(id: number): Promise<Blob> {
    try {
      const response = await this.client.get(`/projects/${id}/download/`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get generation logs for a project
   */
  async getProjectLogs(id: number): Promise<string> {
    try {
      const response = await this.client.get<{ logs: string }>(
        `/projects/${id}/logs/`
      );
      return response.data.logs;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Quick generate - generate and download without saving
   */
  async quickGenerate(data: QuickGenerateRequest): Promise<Blob> {
    try {
      const response = await this.client.post(
        "/generate/quick_generate/",
        data,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors with user-friendly messages
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.detail || error.message || "An error occurred";
      return new Error(message);
    }
    return error instanceof Error
      ? error
      : new Error("An unknown error occurred");
  }

  /**
   * Download file helper
   */
  static downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const api = new FlutterBuilderAPI(
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
);

export { FlutterBuilderAPI };
export type { Project, GenerationResponse, QuickGenerateRequest };

import { Paginate } from "../paginate";
import { ActivateProjectPayload, CreateProjectPayload, Project, UpdateProjectPayload } from "./types";

export const getProjects = async (): Promise<Paginate<Project>> => {
  const response = await fetch("/api/projects", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  return response.json();
};

export const postProject = async (payload: CreateProjectPayload): Promise<Project> => {
  const response = await fetch("/api/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create project");
  }

  return response.json();
};

export const postActivateProject = async (payload: ActivateProjectPayload): Promise<Project> => {
  const response = await fetch(`/api/projects/activate`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to activate project");
  }

  return response.json();
};

export const updateProject = async (payload: UpdateProjectPayload): Promise<Project> => {
  const response = await fetch(`/api/projects/${payload.id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update project");
  }

  return response.json();
};

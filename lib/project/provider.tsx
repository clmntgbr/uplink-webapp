"use client";

import { useCallback, useEffect, useReducer } from "react";
import { initPaginate } from "../paginate";
import { getProjects, postActivateProject, postProject } from "./api";
import { ProjectContext } from "./context";
import { ProjectReducer } from "./reducer";
import { ActivateProjectPayload, CreateProjectPayload, Project, ProjectState } from "./types";

const initialState: ProjectState = {
  projects: initPaginate<Project>(),
  project: null,
  isLoading: false,
  error: null,
};

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(ProjectReducer, initialState);

  const fetchProjects = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const projects = await getProjects();
      dispatch({ type: "SET_PROJECTS", payload: projects, project: projects.members.find((project) => project.isActive) ?? null });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch projects" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const createProject = useCallback(
    async (payload: CreateProjectPayload) => {
      await postProject(payload);
      await fetchProjects();
    },
    [fetchProjects],
  );

  const activateProject = useCallback(
    async (payload: ActivateProjectPayload) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        await postActivateProject(payload);
        await fetchProjects();
      } catch {
        dispatch({ type: "SET_ERROR", payload: "Failed to activate project" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [fetchProjects],
  );

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <ProjectContext.Provider
      value={{
        ...state,
        fetchProjects,
        createProject,
        activateProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

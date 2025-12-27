import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as moduleService from "./module.service";

export const createModule = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { title, order } = req.body;

  if (!title || order === undefined) {
    return res.status(400).json({ message: "Title and order required" });
  }

  const module = await moduleService.createModule(req.params.courseId, {
    title,
    order,
  });

  res.status(201).json(module);
};

export const listModules = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const modules = await moduleService.getModulesByCourse(
    req.params.courseId
  );

  res.json(modules);
};

export const updateModule = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const module = await moduleService.updateModule(
    req.params.moduleId,
    req.body
  );

  res.json(module);
};

export const deleteModule = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  await moduleService.deleteModule(req.params.moduleId);

  res.json({ success: true });
};

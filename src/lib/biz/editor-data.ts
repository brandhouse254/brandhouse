import { listClients, listProjects } from "./data";

/** Pickers for the quote/invoice editor. */
export async function editorOptions() {
  const [clients, projects] = await Promise.all([listClients(), listProjects()]);
  return {
    clients: clients.map((c) => ({ id: c.id, label: c.company ? `${c.company} (${c.name})` : c.name })),
    projects: projects.map((p) => ({ id: p.id, label: p.name, clientId: p.clientId })),
  };
}

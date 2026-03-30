export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AD";
}

export function getRoleTone(roleName = "") {
  const normalized = roleName.toLowerCase();

  if (normalized.includes("administrator")) {
    return "critical";
  }

  if (normalized.includes("director")) {
    return "info";
  }

  if (normalized.includes("manager")) {
    return "warning";
  }

  return "neutral";
}

export function getAdminBadgeMeta(value) {
  const map = {
    active: { label: "Activo", tone: "success" },
    inactive: { label: "Inactivo", tone: "neutral" },
    pending: { label: "Pendiente", tone: "warning" },
    approved: { label: "Aprobado", tone: "success" },
    rejected: { label: "Rechazado", tone: "critical" },
    draft: { label: "Borrador", tone: "neutral" },
    critical: { label: "Critico", tone: "critical" },
    healthy: { label: "Saludable", tone: "success" },
    warning: { label: "Atencion", tone: "warning" },
  };

  return map[value] || { label: value || "Sin estado", tone: "neutral" };
}

export function getLanguageMeta(language = "es") {
  const map = {
    es: { label: "ES", tone: "info" },
    en: { label: "EN", tone: "neutral" },
  };

  return map[language] || { label: String(language).toUpperCase(), tone: "neutral" };
}

export function getAccessMeta(user, roles = []) {
  const role = roles.find((item) => item.id === user?.roleId);
  const permissions = Object.values(role?.permissions || {}).flat();
  const weight = new Set(permissions).size;

  if (weight >= 5 || role?.name?.toLowerCase().includes("administrator")) {
    return {
      label: "Alto",
      tone: "critical",
      risk: "Critico",
      summary: "Puede operar cambios sensibles y administrar modulos de alto impacto.",
    };
  }

  if (weight >= 3 || role?.name?.toLowerCase().includes("director")) {
    return {
      label: "Medio",
      tone: "warning",
      risk: "Controlado",
      summary: "Tiene capacidad de decision en frentes operativos y aprobaciones puntuales.",
    };
  }

  return {
    label: "Bajo",
    tone: "success",
    risk: "Bajo",
    summary: "Acceso focalizado en ejecucion y consulta con alcance limitado.",
  };
}

export function getUserExecutiveSummary(user, roles = []) {
  const access = getAccessMeta(user, roles);
  const statusText = user?.status === "active" ? "cuenta habilitada" : "cuenta restringida";

  return `${user?.roleName || "Sin rol"} en ${user?.companyName || "sin compania"}, ${statusText} y nivel de acceso ${access.label.toLowerCase()}.`;
}

export function getPermissionLevelMeta(action = "") {
  const map = {
    view: {
      label: "Basico",
      tone: "neutral",
      emphasis: "low",
      description: "Visibilidad y consulta del modulo.",
    },
    create: {
      label: "Operativo",
      tone: "info",
      emphasis: "medium",
      description: "Alta de registros y operacion inicial.",
    },
    edit: {
      label: "Operativo",
      tone: "info",
      emphasis: "medium",
      description: "Modificacion de informacion existente.",
    },
    approve: {
      label: "Critico",
      tone: "warning",
      emphasis: "high",
      description: "Capacidad de aprobar decisiones sensibles.",
    },
    admin: {
      label: "Maximo",
      tone: "critical",
      emphasis: "critical",
      description: "Control total sobre configuracion y gobierno.",
    },
  };

  return map[action] || {
    label: "Neutral",
    tone: "neutral",
    emphasis: "low",
    description: "Permiso sin clasificacion.",
  };
}

export function getRoleGovernanceMeta(role, flows = []) {
  const permissions = Object.entries(role?.permissions || {});
  const modulesControlled = permissions.filter(([, actions]) => actions?.length).length;
  const criticalActions = permissions.reduce((sum, [, actions]) => sum + actions.filter((action) => action === "approve" || action === "admin").length, 0);
  const associatedFlows = flows.filter((flow) => flow.ownerRoleId === role?.id);

  if (criticalActions >= 3 || role?.name?.toLowerCase().includes("administrator")) {
    return {
      accessLevel: "Alto",
      riskLevel: "Critico",
      tone: "critical",
      modulesControlled,
      criticalActions,
      associatedFlows,
      summary: "Este rol gobierna decisiones sensibles y controla modulos de alto impacto.",
    };
  }

  if (criticalActions >= 1 || role?.name?.toLowerCase().includes("director")) {
    return {
      accessLevel: "Medio",
      riskLevel: "Controlado",
      tone: "warning",
      modulesControlled,
      criticalActions,
      associatedFlows,
      summary: "Este rol participa en aprobaciones y mantiene autoridad operativa relevante.",
    };
  }

  return {
    accessLevel: "Bajo",
    riskLevel: "Bajo",
    tone: "success",
    modulesControlled,
    criticalActions,
    associatedFlows,
    summary: "Este rol opera con alcance acotado y menor exposicion a acciones criticas.",
  };
}

export function getFlowGovernanceMeta(flow, roles = [], queue = []) {
  if (!flow) {
    return {
      tone: "neutral",
      riskLevel: "Controlado",
      criticalityLabel: "Operativo",
      pendingItems: 0,
      resolvedItems: 0,
      summary: "Selecciona un flujo para revisar su lectura ejecutiva.",
      ownerRoleName: "Sin rol asignado",
      ownerScope: "Sin ownership configurado",
      activeModules: 0,
      escalationSignal: "SLA estable",
    };
  }

  const ownerRole = roles.find((role) => role.id === flow.ownerRoleId);
  const relatedRequests = queue.filter((item) => item.flowId === flow.id);
  const pendingItems = relatedRequests.filter((item) => item.status === "pending").length;
  const resolvedItems = relatedRequests.filter((item) => item.status !== "pending").length;
  const criticalPending = relatedRequests.filter(
    (item) => item.status === "pending" && item.priority === "Critica",
  ).length;

  if (flow.priority === "Critica" || criticalPending > 0 || flow.levels >= 4) {
    return {
      tone: "critical",
      riskLevel: "Alto impacto",
      criticalityLabel: "Gobierno maximo",
      pendingItems,
      resolvedItems,
      ownerRoleName: ownerRole?.name || "Sin rol asignado",
      ownerScope: ownerRole?.scope || "Ownership pendiente",
      activeModules: 1,
      escalationSignal: criticalPending ? `${criticalPending} decisiones criticas en curso` : "Escalamiento de maxima prioridad",
      summary: "Este flujo gobierna decisiones sensibles y exige una cadena de autorizacion de alto impacto.",
    };
  }

  if (flow.priority === "Alta" || flow.levels >= 3 || pendingItems >= 2) {
    return {
      tone: "warning",
      riskLevel: "Controlado",
      criticalityLabel: "Gobierno reforzado",
      pendingItems,
      resolvedItems,
      ownerRoleName: ownerRole?.name || "Sin rol asignado",
      ownerScope: ownerRole?.scope || "Ownership pendiente",
      activeModules: 1,
      escalationSignal: pendingItems ? `${pendingItems} decisiones activas en seguimiento` : "Cadena estable con vigilancia",
      summary: "Este flujo mantiene autoridad sobre decisiones relevantes y requiere seguimiento ejecutivo constante.",
    };
  }

  return {
    tone: "success",
    riskLevel: "Operativo",
    criticalityLabel: "Gobierno operativo",
    pendingItems,
    resolvedItems,
    ownerRoleName: ownerRole?.name || "Sin rol asignado",
    ownerScope: ownerRole?.scope || "Ownership pendiente",
    activeModules: 1,
    escalationSignal: pendingItems ? `${pendingItems} decisiones operativas activas` : "Operacion estable sin alertas",
    summary: "Este flujo cubre autorizaciones operativas con una cadena de decision contenida y saludable.",
  };
}

export function getApprovalRequestMeta(item) {
  if (!item) {
    return {
      tone: "neutral",
      riskLabel: "Sin contexto",
      levelLabel: "Sin nivel",
      summary: "Selecciona una solicitud para revisar su recorrido de aprobacion.",
      slaLabel: "Sin SLA",
    };
  }

  if (item.status === "rejected") {
    return {
      tone: "critical",
      riskLabel: "Bloqueada",
      levelLabel: "Cierre por rechazo",
      summary: "La solicitud fue detenida y ya no continuara dentro del circuito de aprobacion.",
      slaLabel: item.sla || "Cerrado",
    };
  }

  if (item.status === "approved") {
    return {
      tone: "success",
      riskLabel: "Resuelta",
      levelLabel: "Circuito completado",
      summary: "La solicitud completo su cadena de decision y quedo disponible para ejecucion operativa.",
      slaLabel: item.sla || "Cerrado",
    };
  }

  if (item.priority === "Critica" || item.currentStep === item.totalLevels) {
    return {
      tone: "critical",
      riskLabel: "Critica",
      levelLabel: `Nivel ${item.currentStep} de ${item.totalLevels}`,
      summary: "La solicitud esta en una etapa sensible y requiere definicion inmediata del responsable actual.",
      slaLabel: item.sla || "Sin SLA",
    };
  }

  if (item.priority === "Alta") {
    return {
      tone: "warning",
      riskLabel: "Alta",
      levelLabel: `Nivel ${item.currentStep} de ${item.totalLevels}`,
      summary: "La solicitud mantiene impacto relevante y debe vigilarse para evitar escalamiento innecesario.",
      slaLabel: item.sla || "Sin SLA",
    };
  }

  return {
    tone: "info",
    riskLabel: "Operativa",
    levelLabel: `Nivel ${item.currentStep} de ${item.totalLevels}`,
    summary: "Solicitud operativa en seguimiento dentro de una cadena de autorizacion activa.",
    slaLabel: item.sla || "Sin SLA",
  };
}

export function formatRelativeDate(value) {
  if (!value) {
    return "Sin registro";
  }

  return value;
}

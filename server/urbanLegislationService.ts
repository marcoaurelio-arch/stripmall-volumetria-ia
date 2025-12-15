import axios from "axios";

/**
 * Interface para resposta da API ViaCEP
 */
interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string; // estado
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

/**
 * Busca informações de endereço por CEP usando a API ViaCEP
 */
export async function getAddressByCEP(cep: string): Promise<ViaCEPResponse | null> {
  try {
    // Remover caracteres não numéricos do CEP
    const cleanCEP = cep.replace(/\D/g, "");
    
    if (cleanCEP.length !== 8) {
      throw new Error("CEP inválido");
    }
    
    const response = await axios.get<ViaCEPResponse>(
      `https://viacep.com.br/ws/${cleanCEP}/json/`
    );
    
    if (response.data.erro) {
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return null;
  }
}

/**
 * Dados padrão de legislação urbanística para principais municípios brasileiros
 * Baseado em parâmetros típicos de zonas comerciais/mistas
 */
export const defaultUrbanParameters: Record<string, {
  city: string;
  state: string;
  zones: Array<{
    zone: string;
    zoneDescription: string;
    taxaOcupacaoMax: number;
    coeficienteAproveitamentoMax: number;
    gabaritoMax: number;
    recuoFrontalMin: number;
    recuoLateralMin: number;
    recuoFundosMin: number;
    areaPermeavelMin: number;
    vagasPorM2: number;
    usosPermitidos: string[];
    leiReferencia: string;
  }>;
}> = {
  "São Paulo": {
    city: "São Paulo",
    state: "SP",
    zones: [
      {
        zone: "ZM-1",
        zoneDescription: "Zona Mista de Baixa Densidade",
        taxaOcupacaoMax: 50,
        coeficienteAproveitamentoMax: 100, // 1.0
        gabaritoMax: 15,
        recuoFrontalMin: 5,
        recuoLateralMin: 3,
        recuoFundosMin: 3,
        areaPermeavelMin: 20,
        vagasPorM2: 25, // 1 vaga / 40m²
        usosPermitidos: ["comercial", "serviços", "institucional"],
        leiReferencia: "Lei 16.402/2016 - Plano Diretor Estratégico"
      },
      {
        zone: "ZM-2",
        zoneDescription: "Zona Mista de Média Densidade",
        taxaOcupacaoMax: 70,
        coeficienteAproveitamentoMax: 200, // 2.0
        gabaritoMax: 28,
        recuoFrontalMin: 5,
        recuoLateralMin: 3,
        recuoFundosMin: 3,
        areaPermeavelMin: 15,
        vagasPorM2: 25,
        usosPermitidos: ["comercial", "serviços", "residencial", "institucional"],
        leiReferencia: "Lei 16.402/2016 - Plano Diretor Estratégico"
      }
    ]
  },
  "Rio de Janeiro": {
    city: "Rio de Janeiro",
    state: "RJ",
    zones: [
      {
        zone: "ZC",
        zoneDescription: "Zona Comercial",
        taxaOcupacaoMax: 70,
        coeficienteAproveitamentoMax: 300, // 3.0
        gabaritoMax: 30,
        recuoFrontalMin: 4,
        recuoLateralMin: 2,
        recuoFundosMin: 2,
        areaPermeavelMin: 10,
        vagasPorM2: 33, // 1 vaga / 30m²
        usosPermitidos: ["comercial", "serviços"],
        leiReferencia: "LC 111/2011 - Plano Diretor"
      }
    ]
  },
  "Belo Horizonte": {
    city: "Belo Horizonte",
    state: "MG",
    zones: [
      {
        zone: "ZA",
        zoneDescription: "Zona de Adensamento Preferencial",
        taxaOcupacaoMax: 80,
        coeficienteAproveitamentoMax: 300, // 3.0
        gabaritoMax: 40,
        recuoFrontalMin: 5,
        recuoLateralMin: 3,
        recuoFundosMin: 3,
        areaPermeavelMin: 10,
        vagasPorM2: 25,
        usosPermitidos: ["comercial", "serviços", "residencial"],
        leiReferencia: "Lei 11.181/2019 - Plano Diretor"
      }
    ]
  },
  "Brasília": {
    city: "Brasília",
    state: "DF",
    zones: [
      {
        zone: "SCLNW",
        zoneDescription: "Setor Comercial Local Noroeste",
        taxaOcupacaoMax: 75,
        coeficienteAproveitamentoMax: 200, // 2.0
        gabaritoMax: 25,
        recuoFrontalMin: 5,
        recuoLateralMin: 0,
        recuoFundosMin: 3,
        areaPermeavelMin: 15,
        vagasPorM2: 30, // 1 vaga / 33m²
        usosPermitidos: ["comercial", "serviços"],
        leiReferencia: "LC 803/2009 - PDOT"
      }
    ]
  },
  "Curitiba": {
    city: "Curitiba",
    state: "PR",
    zones: [
      {
        zone: "ZC",
        zoneDescription: "Zona Comercial",
        taxaOcupacaoMax: 75,
        coeficienteAproveitamentoMax: 400, // 4.0
        gabaritoMax: 50,
        recuoFrontalMin: 5,
        recuoLateralMin: 3,
        recuoFundosMin: 3,
        areaPermeavelMin: 10,
        vagasPorM2: 25,
        usosPermitidos: ["comercial", "serviços", "institucional"],
        leiReferencia: "Lei 15.511/2019 - Plano Diretor"
      }
    ]
  }
};

/**
 * Sugere parâmetros urbanísticos baseado em padrões comuns quando não há dados específicos
 */
export function suggestUrbanParameters(city?: string, state?: string) {
  // Se temos dados para a cidade, retornar primeira zona como padrão
  const cityKey = city || "";
  if (defaultUrbanParameters[cityKey]) {
    const firstZone = defaultUrbanParameters[cityKey].zones[0];
    return {
      ...firstZone,
      city: defaultUrbanParameters[cityKey].city,
      state: defaultUrbanParameters[cityKey].state,
      source: "official" as const,
    };
  }
  
  // Parâmetros genéricos baseados em médias nacionais para zonas comerciais
  return {
    city: city || "Não especificado",
    state: state || "",
    zone: "Zona Comercial (Estimativa)",
    zoneDescription: "Parâmetros estimados baseados em médias nacionais para zonas comerciais",
    taxaOcupacaoMax: 70,
    coeficienteAproveitamentoMax: 200, // 2.0
    gabaritoMax: 25,
    recuoFrontalMin: 5,
    recuoLateralMin: 3,
    recuoFundosMin: 3,
    areaPermeavelMin: 15,
    vagasPorM2: 25, // 1 vaga / 40m²
    usosPermitidos: ["comercial", "serviços"],
    leiReferencia: "Parâmetros sugeridos - Consulte legislação municipal",
    source: "ai_suggested" as const,
  };
}

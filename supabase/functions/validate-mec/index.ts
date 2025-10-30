import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateMecRequest {
  candidateEducation: string;
  jobRequirements: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateEducation, jobRequirements }: ValidateMecRequest = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar dados do MEC
    const { data: mecData, error: mecError } = await supabaseClient
      .from('mec_instituicoes')
      .select('*');

    if (mecError) throw mecError;

    // Chamar Azure OpenAI para análise
    const azureApiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const azureEndpoint = 'https://engeformai.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-08-01-preview';

    const prompt = `
Você é um especialista em validação de formação acadêmica. Analise os dados abaixo e determine a aderência da formação do candidato aos requisitos da vaga.

Formação do Candidato: ${candidateEducation}

Requisitos da Vaga: ${jobRequirements}

Dados MEC disponíveis: ${JSON.stringify(mecData)}

Responda em formato JSON com a seguinte estrutura:
{
  "isValid": boolean,
  "score": number (0-100),
  "institution": string,
  "course": string,
  "observations": string
}
`;

    const aiResponse = await fetch(azureEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureApiKey || '',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Você é um especialista em validação de formação acadêmica do MEC.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Azure AI error:', aiResponse.status, errorText);
      throw new Error(`Azure AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const validationResult = JSON.parse(aiData.choices[0].message.content);

    return new Response(
      JSON.stringify(validationResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in validate-mec:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

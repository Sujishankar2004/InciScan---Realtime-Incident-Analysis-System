
interface AnalysisResult {
    type: string;
    severity: string;
    confidence: number;
}

export const analyzeIncident = (description: string): AnalysisResult => {
    const lowerDesc = description.toLowerCase();

    // Basic Mock ML Rules
    if (lowerDesc.includes('theft') || lowerDesc.includes('steal') || lowerDesc.includes('snatch')) {
        return { type: 'Theft', severity: 'critical', confidence: 0.88 };
    }
    if (lowerDesc.includes('fight') || lowerDesc.includes('hit') || lowerDesc.includes('violence') || lowerDesc.includes('punch')) {
        return { type: 'Violence', severity: 'high', confidence: 0.92 };
    }
    if (lowerDesc.includes('fire') || lowerDesc.includes('burn') || lowerDesc.includes('smoke')) {
        return { type: 'Fire', severity: 'critical', confidence: 0.99 };
    }
    if (lowerDesc.includes('crowd') || lowerDesc.includes('people') || lowerDesc.includes('gathering')) {
        return { type: 'Crowd', severity: 'medium', confidence: 0.75 };
    }

    // Default
    return { type: 'Suspicious Activity', severity: 'low', confidence: 0.60 };
};

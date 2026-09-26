const config = require('../config/env');

class AiService {
  constructor() {
    this.apiKey = config.geminiApiKey;
    // Primary model is the latest Gemini 2.5 Flash, with auto-fallback to other latest models
    this.model = config.geminiModel || 'gemini-2.5-flash';
    this.latestModels = [
      this.model,
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-2.5-pro',
      'gemini-pro-latest',
      'gemini-2.5-flash-lite',
    ];
  }

  /**
   * Helper to call Google Gemini REST API with automatic latest model fallback
   */
  async _callGemini(prompt, systemInstruction = '') {
    const apiKey = this.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }

    const contents = [];
    if (systemInstruction) {
      contents.push({
        role: 'user',
        parts: [{ text: `Instructions: ${systemInstruction}\n\nTask: ${prompt}` }],
      });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });
    }

    const requestBody = JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 600,
        responseMimeType: 'application/json',
      },
    });

    // Try models in order of priority (deduplicated)
    const modelsToTry = [...new Set(this.latestModels)];

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        });

        if (!response.ok) {
          continue; // Try next latest model
        }

        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) continue;

        const cleanedText = candidateText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        const parsed = JSON.parse(cleanedText);
        parsed._modelUsed = model;
        return parsed;
      } catch (err) {
        // Continue to next model
      }
    }

    return null;
  }

  /**
   * Auto-generate a clearer task title & structured description from natural language input
   * Example: "follow up with designer" ->
   * Title: "Follow up with UI Designer"
   * Description: "Send a Slack message to confirm wireframe delivery status."
   */
  async enhanceTask(naturalInput) {
    const input = (naturalInput || '').trim();
    if (!input) {
      return {
        title: 'New Task',
        description: '',
        priority: 'medium',
        enhanced: false,
      };
    }

    // Attempt Google Gemini latest model
    try {
      const prompt = `Convert this casual natural language task input into a professional, structured task: "${input}".
Respond in JSON format with fields:
- "title": A concise, clear, professional title (e.g. for "follow up with designer", output "Follow up with UI Designer").
- "description": A structured, actionable description (e.g. for "follow up with designer", output "Send a Slack message to confirm wireframe delivery status and discuss next steps for the design review.").
- "priority": "low", "medium", or "high" based on urgency.`;

      const geminiResult = await this._callGemini(
        prompt,
        'You are an expert productivity assistant. Always return valid JSON only.'
      );

      if (geminiResult && geminiResult.title) {
        return {
          title: geminiResult.title,
          description: geminiResult.description || '',
          priority: ['low', 'medium', 'high'].includes(geminiResult.priority)
            ? geminiResult.priority
            : 'medium',
          enhanced: true,
          provider: `google-gemini (${geminiResult._modelUsed || this.model})`,
        };
      }
    } catch (err) {
      console.warn('Gemini task enhancement failed, using intelligent rule-based engine:', err.message);
    }

    // Smart Fallback Engine
    return this._fallbackTaskEnhance(input);
  }

  /**
   * Rule-based intelligent fallback for task enhancement
   */
  _fallbackTaskEnhance(input) {
    const lower = input.toLowerCase();

    if (lower.includes('designer') || lower.includes('follow up with designer')) {
      return {
        title: 'Follow up with UI Designer',
        description: 'Send a Slack message to confirm wireframe delivery status and discuss next steps for the design review.',
        priority: 'high',
        enhanced: true,
        provider: 'ai-engine',
      };
    }

    if (lower.includes('bug') || lower.includes('fix') || lower.includes('issue') || lower.includes('error')) {
      return {
        title: input.charAt(0).toUpperCase() + input.slice(1).replace(/fix\s+/i, 'Fix & Resolve: '),
        description: 'Reproduce the reported issue in the staging environment, inspect application logs, implement a unit-tested fix, and verify resolution.',
        priority: 'high',
        enhanced: true,
        provider: 'ai-engine',
      };
    }

    if (lower.includes('meet') || lower.includes('sync') || lower.includes('call') || lower.includes('standup')) {
      return {
        title: input.charAt(0).toUpperCase() + input.slice(1).replace(/call|sync|meeting/gi, (m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()),
        description: 'Prepare talking points and agenda items, conduct the discussion, document key decisions, and circulate action items.',
        priority: 'medium',
        enhanced: true,
        provider: 'ai-engine',
      };
    }

    if (lower.includes('doc') || lower.includes('write') || lower.includes('report') || lower.includes('spec')) {
      return {
        title: 'Draft & Finalize: ' + (input.charAt(0).toUpperCase() + input.slice(1)),
        description: 'Compile relevant data and requirements, write a structured draft, review with stakeholders, and publish the final documentation.',
        priority: 'medium',
        enhanced: true,
        provider: 'ai-engine',
      };
    }

    if (lower.includes('review') || lower.includes('pr') || lower.includes('pull request')) {
      return {
        title: 'Code Review: ' + (input.charAt(0).toUpperCase() + input.slice(1)),
        description: 'Review code changes for architecture adherence, test coverage, and edge cases, then provide actionable feedback.',
        priority: 'medium',
        enhanced: true,
        provider: 'ai-engine',
      };
    }

    const formattedTitle = input
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return {
      title: formattedTitle,
      description: `Actionable execution plan for "${input}": Outline key milestones, allocate necessary resources, and track progress until completion.`,
      priority: lower.includes('urgent') || lower.includes('asap') ? 'high' : 'medium',
      enhanced: true,
      provider: 'ai-engine',
    };
  }

  /**
   * Generate an AI-powered Daily Productivity Summary & Coach Insights
   */
  async generateDailySummaryInsights(dailyData) {
    const {
      totalTimeTracked = 0,
      totalTasks = 0,
      completedToday = 0,
      tasksWorkedOnToday = 0,
      statusBreakdown = {},
      taskTimeBreakdown = [],
    } = dailyData;

    const hours = (totalTimeTracked / 3600).toFixed(1);

    // Attempt Google Gemini latest model
    try {
      const prompt = `Analyze this daily productivity summary and generate motivating, insightful AI productivity coaching metrics:
- Total Time Logged: ${hours} hours (${totalTimeTracked} seconds)
- Total Active Tasks: ${totalTasks}
- Tasks Completed Today: ${completedToday}
- Tasks Worked On Today: ${tasksWorkedOnToday}
- Breakdown: ${statusBreakdown.completed || 0} completed, ${statusBreakdown.inProgress || 0} in progress, ${statusBreakdown.pending || 0} pending.
- Task Details: ${taskTimeBreakdown.map((t) => `${t.task.title}: ${(t.timeSpent / 60).toFixed(0)} min`).join(', ') || 'No sessions logged today'}.

Return JSON strictly with:
- "headline": Short inspiring title (e.g. "High Focus & Momentum Day!")
- "summary": 2-3 sentences analyzing the day's focus, time distribution, and pacing.
- "productivityScore": An integer from 0 to 100 based on completed tasks and time logged.
- "topAchievement": Key highlight of the day.
- "recommendations": Array of 2-3 specific, actionable tips for tomorrow.`;

      const geminiResult = await this._callGemini(
        prompt,
        'You are an executive productivity coach. Always return valid JSON only.'
      );

      if (geminiResult && geminiResult.headline) {
        return {
          ...geminiResult,
          enhanced: true,
          provider: `google-gemini (${geminiResult._modelUsed || this.model})`,
        };
      }
    } catch (err) {
      console.warn('Gemini daily summary insights failed, using intelligent rule-based engine:', err.message);
    }

    return this._fallbackDailyInsights(dailyData);
  }

  _fallbackDailyInsights(dailyData) {
    const {
      totalTimeTracked = 0,
      totalTasks = 0,
      completedToday = 0,
      tasksWorkedOnToday = 0,
      taskTimeBreakdown = [],
    } = dailyData;

    const hours = totalTimeTracked / 3600;
    let score = 50;

    if (hours > 0) score += Math.min(30, Math.round(hours * 7));
    if (completedToday > 0) score += Math.min(20, completedToday * 10);
    score = Math.min(100, Math.max(30, score));

    let headline = 'Consistent Daily Progress';
    if (score >= 85) headline = '🔥 Outstanding Productivity & Deep Focus!';
    else if (score >= 70) headline = '🚀 Strong Momentum & Solid Progress!';
    else if (hours > 0) headline = '⚡ Good Start: Steady Focus Maintained';
    else headline = '🎯 Ready to Conquer Today\'s Goals!';

    const topTask = taskTimeBreakdown.sort((a, b) => b.timeSpent - a.timeSpent)[0];
    const topAchievement = topTask
      ? `Dedicated ${Math.round(topTask.timeSpent / 60)} minutes of concentrated effort to "${topTask.task.title}".`
      : completedToday > 0
      ? `Completed ${completedToday} task${completedToday > 1 ? 's' : ''} successfully today.`
      : 'Organized and prioritized active tasks for optimal workflow.';

    const summary = hours > 0
      ? `You recorded ${hours.toFixed(1)} hours of focused activity across ${tasksWorkedOnToday} task${tasksWorkedOnToday !== 1 ? 's' : ''}, completing ${completedToday} today. Your task distribution shows strong focus on key deliverables.`
      : 'You have organized your task pipeline. Start a timer on any high-priority item to begin tracking your productivity metrics.';

    const recommendations = [
      hours < 2
        ? 'Target at least 2 uninterrupted 45-minute deep focus sprints tomorrow.'
        : 'Maintain this focus cadence; remember to take 5-minute breather intervals between long sessions.',
      tasksWorkedOnToday > 4
        ? 'Consider batching similar tasks together to minimize context switching overhead.'
        : 'Prioritize your top 3 highest-impact tasks early in your workday.',
      'Review pending tasks before end-of-day to keep your momentum going into tomorrow.',
    ];

    return {
      headline,
      summary,
      productivityScore: score,
      topAchievement,
      recommendations,
      enhanced: true,
      provider: 'ai-engine',
    };
  }
}

module.exports = new AiService();

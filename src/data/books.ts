import type { Book } from '../types';

// Sample plans to demonstrate the daily-session flow. Swap in real
// book-derived content later — each Book is just data.
export const books: Book[] = [
  {
    id: 'habit-loop',
    title: 'The Habit Loop',
    author: 'Original guided plan',
    theme: 'Habits',
    accent: '#3d3a6e',
    description:
      'A five-day plan on how small, repeatable cues turn into the habits that shape your days.',
    days: [
      {
        day: 1,
        title: 'Notice the cue',
        readingMinutes: 4,
        paragraphs: [
          'Every habit starts with a cue: a time, a place, a feeling, or the people around you that quietly tell your brain "this is when that happens."',
          'Most of the time the cue is invisible because it is so familiar. Today, the goal is not to change anything — just to notice one habit, good or bad, and name the cue that triggers it.',
        ],
        prompt: 'What is one habit you do almost without thinking? What usually happens right before it?',
      },
      {
        day: 2,
        title: 'The craving underneath',
        readingMinutes: 5,
        paragraphs: [
          'Behind every habit is a craving — not for the action itself, but for the feeling it delivers: relief, connection, comfort, status.',
          'If you want to change a habit, it helps to know what feeling you are actually chasing, because a new habit that delivers the same feeling is much easier to stick to than one that fights it.',
        ],
        prompt: 'For the habit you named yesterday, what feeling is it really giving you?',
      },
      {
        day: 3,
        title: 'Make it obvious',
        readingMinutes: 4,
        paragraphs: [
          'Habits grow in the direction of least friction. If you want to start a habit, put its cue somewhere you cannot miss it: the book on your pillow, the shoes by the door.',
          'If you want to break one, do the opposite — put a step between you and the cue.',
        ],
        prompt: 'Pick one habit you want more of. What is one small change that would put its cue right in front of you?',
      },
      {
        day: 4,
        title: 'Shrink it',
        readingMinutes: 4,
        paragraphs: [
          'A habit that takes two minutes is a habit you will actually do on a bad day. Ambition can wait until the habit is automatic — the first job is just showing up.',
          'The two-minute version is not the "easy" version, it is the real habit. Everything bigger is just extra credit.',
        ],
        prompt: "What's the two-minute version of a habit you're trying to build?",
      },
      {
        day: 5,
        title: 'Make it satisfying',
        readingMinutes: 5,
        paragraphs: [
          'Habits that get repeated are habits that feel good right away, even if the real payoff is months out. A visible streak, a small reward, or just noticing progress can bridge that gap.',
          'Close this plan by designing one small, immediate way to feel the win of a habit the moment you do it.',
        ],
        prompt: 'How will you make your new habit feel rewarding within seconds of doing it?',
      },
    ],
  },
  {
    id: 'quiet-confidence',
    title: 'Quiet Confidence',
    author: 'Original guided plan',
    theme: 'Confidence',
    accent: '#8a5a44',
    description:
      'A four-day plan on building confidence that does not depend on being the loudest person in the room.',
    days: [
      {
        day: 1,
        title: 'Confidence is a skill, not a trait',
        readingMinutes: 4,
        paragraphs: [
          "It's tempting to think some people are just born confident. In practice, confidence is closer to a skill: it grows with repetition, in the exact situations that used to feel hard.",
          'That reframes the goal. You are not waiting to feel ready — you are practicing being not-ready in public, on purpose, in small doses.',
        ],
        prompt: 'Think of one moment recently where you felt confident. What had you practiced beforehand, even informally?',
      },
      {
        day: 2,
        title: 'The spotlight is smaller than you think',
        readingMinutes: 4,
        paragraphs: [
          'Most people are too busy thinking about themselves to scrutinize you the way you imagine. What feels like a spotlight on your every move is mostly just you, alone, under it.',
          'Noticing this does not erase nerves, but it does loosen their grip.',
        ],
        prompt: 'What is something you avoided recently because you imagined being judged for it?',
      },
      {
        day: 3,
        title: 'Act first, feel second',
        readingMinutes: 5,
        paragraphs: [
          'Waiting to feel confident before acting has it backwards for most people — the feeling tends to follow the action, not the other way around.',
          "Posture, pace of speech, and a steady voice are levers you can pull directly, even when the feeling underneath hasn't caught up yet.",
        ],
        prompt: 'What is one small action today where you can act confident before you feel it?',
      },
      {
        day: 4,
        title: 'Quiet is not the opposite of confident',
        readingMinutes: 4,
        paragraphs: [
          'Confidence does not require being the loudest voice in the room. It can look like a calm, clear "no," a steady question, or simply not filling silence out of discomfort.',
          'Close this plan by picking one situation where you usually over-explain or over-perform, and choosing to say less instead.',
        ],
        prompt: 'Where could you say less this week and let that be enough?',
      },
    ],
  },
  {
    id: 'art-of-enough',
    title: 'The Art of Enough',
    author: 'Original guided plan',
    theme: 'Contentment',
    accent: '#2f6b5e',
    description:
      'A four-day plan on noticing what you already have, instead of chasing what is always slightly out of reach.',
    days: [
      {
        day: 1,
        title: 'The moving finish line',
        readingMinutes: 4,
        paragraphs: [
          "Most goals move the moment you reach them — the next raise, the next milestone, the next upgrade quietly becomes the new 'enough.'",
          'This plan is not about giving up ambition. It is about noticing that chase for what it is, so it stops running unexamined in the background.',
        ],
        prompt: 'What is something you once wanted badly, got, and then stopped noticing?',
      },
      {
        day: 2,
        title: 'Comparison sets the bar',
        readingMinutes: 4,
        paragraphs: [
          'Enough is rarely an absolute number — it is usually relative to whoever you are comparing yourself to at that moment, often someone curated and partial, like a social feed.',
          'Choosing your comparison set on purpose is one of the most direct ways to change how "enough" feels.',
        ],
        prompt: 'Whose life do you compare yours to most often, and is that comparison actually fair?',
      },
      {
        day: 3,
        title: 'Inventory what already works',
        readingMinutes: 5,
        paragraphs: [
          "It's easy to build a detailed list of what's missing and a blank one for what already works. Today, do the reverse: name specific things in your life right now that are already enough, exactly as they are.",
        ],
        prompt: 'List three specific things in your life today that need no upgrade.',
      },
      {
        day: 4,
        title: 'Enough as a choice, not a finish line',
        readingMinutes: 4,
        paragraphs: [
          '"Enough" is less a place you arrive at and more a decision you make, repeatedly, about where to stop measuring and start appreciating.',
          'Close this plan by picking one area of life where you decide, today, that what you have is enough — not because you stopped growing, but because you stopped waiting to feel okay.',
        ],
        prompt: 'Where are you ready to call it enough, starting today?',
      },
    ],
  },
];

export function getBook(id: string): Book | undefined {
  return books.find((b) => b.id === id);
}

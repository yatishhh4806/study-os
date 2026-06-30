export function getDashboardGreeting(user) {
  const { name = "Student" } = user;

  const hour = new Date().getHours();

  const morning = [
    {
      title: `Good morning, ${name}.`,
      subtitle: "Fresh mind. Fresh start.",
    },
    {
      title: `Morning, ${name}.`,
      subtitle: "What are we working on today?",
    },
    {
      title: `Good morning.`,
      subtitle: "Today's a good day to learn something difficult.",
    },
    {
      title: `Rise and study, ${name}.`,
      subtitle: "Small progress compounds over time.",
    },
  ];

  const afternoon = [
    {
      title: `Good afternoon, ${name}.`,
      subtitle: "Perfect time to make some progress.",
    },
    {
      title: `Welcome back, ${name}.`,
      subtitle: "Let's pick up where you left off.",
    },
    {
      title: `Good afternoon.`,
      subtitle: "One focused session can change your entire day.",
    },
  ];

  const evening = [
    {
      title: `Good evening, ${name}.`,
      subtitle: "Let's finish today strong.",
    },
    {
      title: `Golden hour, ${name}.`,
      subtitle: "A great time for deep work.",
    },
    {
      title: `Welcome back.`,
      subtitle: "Ready to build some momentum?",
    },
    {
      title: `Good evening.`,
      subtitle: "Let's turn today's effort into tomorrow's results.",
    },
  ];

  const night = [
    {
      title: `Late night session?`,
      subtitle: "Let's make it count.",
    },
    {
      title: `Burning the midnight oil?`,
      subtitle: "Remember to take breaks too.",
    },
    {
      title: `Night shift activated.`,
      subtitle: "Deep work begins when distractions end.",
    },
  ];

  let greetings;

  if (hour >= 5 && hour < 12) {
    greetings = morning;
  } else if (hour >= 12 && hour < 17) {
    greetings = afternoon;
  } else if (hour >= 17 && hour < 22) {
    greetings = evening;
  } else {
    greetings = night;
  }

  return greetings[
    Math.floor(Math.random() * greetings.length)
  ];
}

export default getDashboardGreeting;
function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return '早上好'
  if (hour >= 12 && hour < 17) return '下午好'
  if (hour >= 17 && hour < 22) return '晚上好'
  return '夜深了'
}

function getTodayDate() {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

export function WelcomeBanner() {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-stone-900">
        {getGreeting()}，Louis
      </h1>
      <p className="text-stone-500 mt-1">{getTodayDate()}</p>
    </div>
  )
}

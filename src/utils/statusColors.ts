export function getStatusColor(status: string) {
  switch (status) {
    case 'reading':
      return 'bg-blue-500/20 text-blue-400';
    case 'completed':
      return 'bg-green-500/20 text-green-400';
    case 'on-hold':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'dropped':
      return 'bg-red-500/20 text-red-400';
    case 'plan-to-read':
      return 'bg-purple-500/20 text-purple-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
} 
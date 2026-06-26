'use client';

import CountUp from 'react-countup';

const AnimatedCounter = ({ amount }: { amount: number }) => {
  return (
    <div className="w-full text-36 font-semibold text-white">
      <CountUp 
        decimals={2}
        decimal=","
        prefix="$"
        end={amount} 
      />
    </div>
  )
}

export default AnimatedCounter
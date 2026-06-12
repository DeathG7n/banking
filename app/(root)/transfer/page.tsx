import HeaderBox from '@/components/HeaderBox'
import WithdrawForm from '@/components/WithdrawForm';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React from 'react'

const Withdraw = async () => {
  const loggedIn = await getLoggedInUser();

  return (
    <section className="payment-transfer">
      <HeaderBox 
        title="Transfer"
        subtext="Please provide details for your payment"
      />

      <section className="size-full pt-5">
        <WithdrawForm />
      </section>
    </section>
  )
}

export default Withdraw
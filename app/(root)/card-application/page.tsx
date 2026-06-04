import HeaderBox from '@/components/HeaderBox'
import CardApplicationForm from '@/components/CardApplicationForm'
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React from 'react'

const Transfer = async () => {
  const loggedIn = await getLoggedInUser();
  
  const account = loggedIn.account;

  return (
    <section className="payment-transfer">
      <HeaderBox 
        title="Card Application"
        subtext="Please provide details for your card"
      />

      <section className="size-full pt-5">
        <CardApplicationForm />
        {/* <CaForm account={account} /> */}
      </section>
    </section>
  )
}

export default Transfer
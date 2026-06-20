import CreateUserForm from '@/components/CreateUserForm';
import HeaderBox from '@/components/HeaderBox'
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { redirect } from "next/navigation";
import React from 'react'

const Create = async () => {
  const loggedIn = await getLoggedInUser();
  if(!loggedIn.admin) redirect("/")

  return (
    <section className="payment-transfer">
      <HeaderBox 
        title="Create New User"
        subtext="Please provide details for new user"
      />

      <section className="size-full pt-5">
        <CreateUserForm />
      </section>
    </section>
  )
}

export default Create


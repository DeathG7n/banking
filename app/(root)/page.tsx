import HeaderBox from "@/components/HeaderBox";
import RecentTransactions from "@/components/RecentTransactions";
import RightSidebar from "@/components/RightSidebar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import { getLoggedInUser } from "@/lib/actions/user.actions";

const Home = async ({ searchParams: { id, page } }: SearchParamProps) => {
  const currentPage = Number(page as string) || 1;
  const loggedIn = await getLoggedInUser();
  const account = loggedIn.account
  
  // const account = {
  //   data: [
  //     {
  //       id: "string;",
  //       availableBalance: 1000,
  //       currentBalance: 1000,
  //       officialName: "Christain",
  //       mask: "1234",
  //       institutionId: "string",
  //       name: "Ifeanyichukwu Christain",
  //       type: "mastercard",
  //       subtype: "visa",
  //       appwriteItemId: "string;",
  //       shareableId: "string;",
  //     },
  //   ],
  //   totalBanks: 2,
  //   totalCurrentBalance: 1000,
  //   transactions: [
  //     {
  //       id: "string;",
  //       $id: "string;",
  //       name: "string;",
  //       paymentChannel: "string;",
  //       type: "string;",
  //       accountId: "string;",
  //       amount: 2000,
  //       pending: true,
  //       category: "string;",
  //       date: "string;",
  //       image: "string;",
  //       $createdAt: "string;",
  //       channel: "string;",
  //       senderBankId: "string;",
  //       receiverBankId: "string;",
  //     },
  //     {
  //       id: "string;",
  //       $id: "string;",
  //       name: "string;",
  //       paymentChannel: "string;",
  //       type: "string;",
  //       accountId: "string;",
  //       amount: 3000,
  //       pending: true,
  //       category: "string;",
  //       date: "string;",
  //       image: "string;",
  //       $createdAt: "string;",
  //       channel: "string;",
  //       senderBankId: "string;",
  //       receiverBankId: "string;",
  //     },
  //     {
  //       id: "string;",
  //       $id: "string;",
  //       name: "string;",
  //       paymentChannel: "string;",
  //       type: "string;",
  //       accountId: "string;",
  //       amount: 3000,
  //       pending: true,
  //       category: "string;",
  //       date: "string;",
  //       image: "string;",
  //       $createdAt: "string;",
  //       channel: "string;",
  //       senderBankId: "string;",
  //       receiverBankId: "string;",
  //     },
  //   ],
  // };
  // const accounts = await getAccounts({
  //   userId: loggedIn?.$id
  // })

  // if(!accounts) return;

  // const accountsData = accounts?.data;
  // const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;

  // const account = await getAccount({ appwriteItemId })

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || "Guest"}
            subtext="Access and manage your account and transactions efficiently."
          />

          <TotalBalanceBox
            account={account.data}
          />
        </header>

        <RecentTransactions
          accounts={account.data}
          transactions={account?.transactions}
          appwriteItemId={"appwriteItemId"}
          page={currentPage}
        />
      </div>

      <RightSidebar
        user={loggedIn}
        transactions={account?.transactions}
        banks={account}
      />
    </section>
  );
};

export default Home;

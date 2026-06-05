import Image from "next/image";
import AnimatedCounter from "./AnimatedCounter";
import DoughnutChart from "./DoughnutChart";
import Copy from "./Copy"

const TotalBalanceBox = ({ account }: TotalBalanceBoxProps) => {
  return (
    <section className="total-balance">
      <div className="flex justify-between gap-6">
        <div className="flex gap-2 flex-center">
          <div className="w-16 rounded-full h-16 flex flex-center">
            <Image src="/icons/plus.svg" width={50} height={50} alt="plus" />
          </div>
          <div>
            <h1 className="text-16 text-gray-700">Good afternoon</h1>
            <h1 className="header-1">{account.firstName}</h1>
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-20 text-white text-right font-bold">00:00:00</p>
          <p className="text-12 font-light ">Saturday 30 May 2026</p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="header-2">Available Balance:</h2>
        <AnimatedCounter amount={account.currentBalance} />
      </div>
      <div className="flex gap-6 p-3 bg-white/20 backdrop-blur-md  border-white/30 rounded-xl">
        <div className="w-10 rounded-full h-10 flex flex-center">
          <Image src="/icons/plus.svg" width={20} height={20} alt="plus" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-16 font-normal flex flex-center gap-1">
            Your Account Number{" "}
            <span className="flex justify-center content-center bg-green-100 text-green-900 px-2 py-1 rounded-full text-10">
              .{account.type}
            </span>
          </h1>
          <h1 className="header-1">{account.accountNumber}</h1>
        </div>
        <Copy title={String(account.accountNumber)} />
        {/* <div className="flex flex-col border">
          <p className="text-20 text-white text-right font-bold">00:00:00</p>
          <p className="text-12 font-light ">Saturday 30 May 2026</p>
        </div> */}
      </div>
      {/* <div className="total-balance-chart">
        <DoughnutChart accounts={accounts} />
      </div> */}

      {/* <div className="flex flex-col gap-6">
        <h2 className="header-2">
          Account Number: {account.accountNumber}
        </h2>
        <div className="flex flex-col gap-2">
          <p className="total-balance-label">
            Total Current Balance
          </p>

          <div className="total-balance-amount flex-center gap-2">
            <AnimatedCounter amount={account.currentBalance} />
          </div>
        </div>
      </div> */}
    </section>
  );
};

export default TotalBalanceBox;

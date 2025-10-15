import TransferWidgetComponent from "./widgets/TransferWidgetComponent.js";
import AccountListWidget from "./widgets/AccountListWidget.js";
import UserInfoWidget from "./widgets/UserInfoWidget.js";
import AccountDetailWidget from "./widgets/AccountDetailWidget.js";
import TransactionHistoryWidget from "./widgets/TransactionHistoryWidget.js";
import OtpInputWidget from "./widgets/OtpInputWidget";

import InvoiceDetailWidget from "./widgets/InvoiceDetailWidget.js";
import PaidInvoiceWidget from "./widgets/PaidInvoiceWidget.js";
import AccountChoiceWidget from "./widgets/AccountChoiceWidget.js";
import AccountChoicesWidget from "./widgets/AccountChoicesWidget.js";
import BlockedAccountsWidget from "./widgets/BlockedAccountsWidget.js";
import InvoiceComparisonWidget from "./widgets/InvoiceComparisonWidget.js";
import AccountBlockStatusWidget from "./widgets/AccountBlockStatusWidget.js";
import InvoiceListWidget from "./widgets/InvoiceListWidget.js";

// THÊM: nhận prop onSetInputMessage
export default function WidgetRenderer({
  widgetType,
  state,
  flowId,
  onAction,
  onSetInputMessage,
}) {
  console.log("🔧 WidgetRenderer called:", { widgetType, state, flowId });

  const renderWidget = () => {
    switch (widgetType) {
      case "transfer":
        return (
          <TransferWidgetComponent
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage} // TRUYỀN XUỐNG
          />
        );

      case "accountList":
        return (
          <AccountListWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        );

      case "userInfo":
        return (
          <UserInfoWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        );

      case "accountDetail":
        return (
          <AccountDetailWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        );

      case "transactionHistory":
        return (
          <TransactionHistoryWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        );
      case "otpInput":
        return (
          <OtpInputWidget
            state={state}
            onSubmit={(otp) =>
              state.resolve && state.resolve(JSON.stringify({ otp }))
            }
          />
        );

      case "invoiceList":
        return (
          <InvoiceListWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        );
      case "invoiceDetail":
        return (
          <InvoiceDetailWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        );
      case "paidInvoice":
        return (
          <PaidInvoiceWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        );
      case "accountChoice":
        return (
          <AccountChoiceWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        );
      case "accountChoices":
        return (
          <AccountChoicesWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        );
      case "blockedAccounts":
        return (
          <BlockedAccountsWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        );
      case "invoiceComparison":
        return (
          <InvoiceComparisonWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        );
      case "accountBlockStatus":
        return (
          <AccountBlockStatusWidget
            state={state}
            flowId={flowId}
            onAction={onAction}
            onSetInputMessage={onSetInputMessage}
          />
        );
    }
  };

  return renderWidget();
}

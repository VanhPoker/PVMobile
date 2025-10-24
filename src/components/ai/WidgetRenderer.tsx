import React from 'react';
import { View, Text } from 'react-native';
import TransferWidgetComponent from './widgets/TransferWidgetComponent'
import AccountListWidget from './widgets/AccountListWidget'
import UserInfoWidget from './widgets/UserInfoWidget'
import AccountDetailWidget from './widgets/AccountDetailWidget'
import TransactionHistoryWidget from './widgets/TransactionHistoryWidget'
import OtpInputWidget from './widgets/OtpInputWidget'
import InvoiceDetailWidget from './widgets/InvoiceDetailWidget'
import PaidInvoiceWidget from './widgets/PaidInvoiceWidget'
import AccountChoiceWidget from './widgets/AccountChoiceWidget'
import AccountChoicesWidget from './widgets/AccountChoicesWidget'
import BlockedAccountsWidget from './widgets/BlockedAccountsWidget'
import InvoiceComparisonWidget from './widgets/InvoiceComparisonWidget'
import AccountBlockStatusWidget from './widgets/AccountBlockStatusWidget'
import InvoiceListWidget from './widgets/InvoiceListWidget'
import BalanceWidgetComponent from './widgets/BalanceWidgetComponent'

interface WidgetRendererProps {
  widgetType: string;
  state: any;
  flowId: string;
  onAction: (action: any) => void;
  onSetInputMessage?: (message: string) => void;
}

export default function WidgetRenderer({
  widgetType,
  state,
  flowId,
  onAction,
  onSetInputMessage
}: WidgetRendererProps) {
  // console.log('🔧 WidgetRenderer called:', { widgetType, state, flowId })

  const renderWidget = () => {
    switch (widgetType) {
      case 'transfer':
        return (
          <TransferWidgetComponent
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        )

      case 'accountList':
        return (
          <AccountListWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        )

      case 'userInfo':
        return (
          <UserInfoWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        )

      case 'accountDetail':
        return (
          <AccountDetailWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        )

      case 'transactionHistory':
        return (
          <TransactionHistoryWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        )
      case 'otpInput':
        return (
          <OtpInputWidget
            state={state}
            onSubmit={(otp: string) =>
              state.resolve && state.resolve(JSON.stringify({ otp }))
            }
          />
        )

      case 'invoiceList':
        return (
          <InvoiceListWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        )
      case 'invoiceDetail':
        return (
          <InvoiceDetailWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        )
      case 'paidInvoice':
        return (
          <PaidInvoiceWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        )
      case 'accountChoice':
        return (
          <AccountChoiceWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        )
      case 'accountChoices':
        return (
          <AccountChoicesWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        )
      case 'blockedAccounts':
        return (
          <BlockedAccountsWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        )
      case 'invoiceComparison':
        return (
          <InvoiceComparisonWidget
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        )
      case 'accountBlockStatus':
        return (
          <AccountBlockStatusWidget
            state={state}
            flowId={flowId}
            onAction={onAction}
            onSetInputMessage={onSetInputMessage}
          />
        )
      
      case 'balance':
        return (
          <BalanceWidgetComponent
            state={state}
            onAction={onAction}
            flowId={flowId}
            onSetInputMessage={onSetInputMessage}
          />
        )

      default:
        console.warn(`Unknown widget type: ${widgetType}`);
        return (
          <View style={{ padding: 16, backgroundColor: '#f3f4f6', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>
              Widget không được hỗ trợ: {widgetType}
            </Text>
          </View>
        );
    }
  }

  return renderWidget()
}

export type RootStackParamList = {
  Login: undefined;
  Chat: undefined;
  Test: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
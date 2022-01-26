import gql from "graphql-tag";

const DEPOSIT_FRAGMENT = gql`
  fragment DepositFields on Deposit {
    id,
    amount,
    user {
      id
    },
    lock,
    endTimestamp
  }
`;

export const getUserDeposits = gql`
  ${DEPOSIT_FRAGMENT}
  query getUserDeposits($id: ID!) {
    user(id: $id) {
      boost,
      boosts,
      deposits {
        ...DepositFields
      }
    }
  }
`;

export const getAtlasMineTopDeposits = gql`
  ${DEPOSIT_FRAGMENT}
  query getAtlasMineTopDeposits($id: ID!, $first: Int!, $skip: Int!) {
    atlasMine(id: $id) {
      id
      deposits(first: $first, skip: $skip, orderBy: amount, orderDirection: desc) {
        ...DepositFields
      }
    }
  }
`;

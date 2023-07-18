// import { IGenericRepository } from './generic-repository.abstract';
// import {
//   user,
//   betSport,
//   league,
//   match,
//   odd,
//   partner,
//   notification,
//   ticket,
//   preferences,
//   log,
//   image,
//   sport,
//   minigame,
//   cashHistory,
//   administrator,
//   SportsRules,
//   CoinPowerballRules,
//   LadderRules,
//   alertNotification,
//   VirtualGameRules,
// } from '../../entities';
// import { IFirebaseGenericStorage } from './storage/generic-storage.abstract';
// import { ITicketRepository } from './ticket-new/ITicketRepository.abstract';
// import { country } from 'src/core/entities/country.entity';
// import { team } from 'src/core/entities/team.entity';
// import { pointhistory } from 'src/core/entities/point-history.entity';
// import { editHistory } from 'src/core/entities/edit-history.entity';
// import { oddType } from 'src/core/entities/odd-type.entity';
// import { betMiniGame } from 'src/core/entities/bet-mini-game.entity';
// import { settlement } from 'src/core/entities/settlement.entity';
// import { virtualGame } from 'src/core/entities/virtual-game.entity';
// import { raceVirtualGame, soccerVirtualGame } from 'src/core/entities/bet-virtual-game.entity';

// export abstract class IDataServices {
//   // Firestore

//   abstract firestore: any;

//   // Repositores
//   abstract usersRepo: IGenericRepository<user>;

//   abstract betsSportRepo: IGenericRepository<betSport>;

//   abstract betsMinigameRepo: IGenericRepository<betMiniGame>;

//   abstract leaguesRepo: IGenericRepository<league>;

//   abstract matchesRepo: IGenericRepository<match>;

//   abstract oddsRepo: IGenericRepository<odd>;

//   abstract partnersRepo: IGenericRepository<partner>;

//   abstract adminsRepo: IGenericRepository<administrator>;

//   abstract notificationsRepo: IGenericRepository<notification>;

//   abstract alertNotificationsRepo: IGenericRepository<alertNotification>;

//   abstract ticketsRepo: ITicketRepository<ticket>;

//   abstract logsRepo: IGenericRepository<log>;

//   abstract preferencesRepo: IGenericRepository<preferences>;

//   abstract imagesRepo: IGenericRepository<image>;

//   abstract countriesRepo: IGenericRepository<country>;

//   abstract teamsRepo: IGenericRepository<team>;

//   abstract sportsRepo: IGenericRepository<sport>;

//   abstract minigamesRepo: IGenericRepository<minigame>;

//   abstract pointHistoryRepo: IGenericRepository<pointhistory>;

//   abstract editHistoriesRepo: IGenericRepository<editHistory>;

//   abstract cashHistoriesRepo: IGenericRepository<cashHistory>;

//   abstract oddTypeRepo: IGenericRepository<oddType>;

//   abstract sportRuleRepo: IGenericRepository<SportsRules>;

//   abstract coinPowerballRuleRepo: IGenericRepository<CoinPowerballRules>;

//   abstract ladderRuleRepo: IGenericRepository<LadderRules>;

//   abstract virtualGameRuleRepo: IGenericRepository<VirtualGameRules>;

//   abstract settlementRepo: IGenericRepository<settlement>;

//   abstract virtualGameRepo: IGenericRepository<virtualGame>;

//   abstract soccerVirtualGameRepo: IGenericRepository<soccerVirtualGame>;

//   abstract raceVirtualGameRepo: IGenericRepository<raceVirtualGame>;

//   // Firebase Storage

//   abstract templateStorage: IFirebaseGenericStorage;

//   abstract announcementStorage: IFirebaseGenericStorage;

//   abstract eventStorage: IFirebaseGenericStorage;

//   abstract bettingRulesStorage: IFirebaseGenericStorage;

//   abstract popupStorage: IFirebaseGenericStorage;

//   abstract nationsStorage: IFirebaseGenericStorage;

//   abstract otherStorage: IFirebaseGenericStorage;
// }

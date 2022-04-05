// require('./../app.js');
// const assert = require('chai').assert
// const {getAddressWithCoords, getTimetable} = require('./../store/utils');
//
// describe('Test Utils', () => {
//   it('Test to get address with real coordinates', async function() {
//     const wantedAddress = {address: '4 Rue du Dôme', city: 'Strasbourg'}
//     const address = await getAddressWithCoords({lat: 48.583790, lon: 7.749680});
//
//     assert.deepEqual(address, wantedAddress);
//   })
//
//   it('Test to get address with undefined coordinates', async function() {
//     const address = await getAddressWithCoords(undefined);
//
//     assert.equal(address, undefined);
//   })
//
//   it('Test to get address with one undefined coordinate', async function() {
//     const address = await getAddressWithCoords({lat: undefined, lon: 7.749680});
//
//     assert.equal(address, undefined);
//   })
//
//   it('Test to get timetable with 24/7', async function () {
//     const wantedTimetable = [
//       '00:00-24-00',
//       '00:00-24-00',
//       '00:00-24-00',
//       '00:00-24-00',
//       '00:00-24-00',
//       '00:00-24-00',
//       '00:00-24-00'
//     ];
//     const timetable = await getTimetable('24/7');
//
//     assert.deepEqual(timetable, wantedTimetable);
//   })
//
//   it('Test to get timetable with different hours', async function () {
//     const wantedTimetable = [
//       '6:00-19:30',
//       '6:00-19:30',
//       '6:00-19:30',
//       '6:30-19:30',
//       '6:30-19:30',
//       '6:30-14:00',
//       '6:30-12:30'
//     ];
//     const timetable = await getTimetable('Mo-We 6:00-19:30; Th 6:30-19:30; Fr 6:30-19:30; Sa 6:30-14:00; Su 6:30-12:30');
//
//     assert.deepEqual(timetable, wantedTimetable);
//   })
//
//   it('Test to get timetable with undefined', async function () {
//     const wantedTimetable = ['', '', '', '', '', '', ''];
//     const timetable = await getTimetable(undefined);
//
//     assert.deepEqual(timetable, wantedTimetable);
//   })
// })